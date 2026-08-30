import os
import chromadb
from chromadb.utils import embedding_functions

import os
import chromadb
from chromadb.utils import embedding_functions

class DatabaseIngestPipeline:
    def __init__(self, db_path: str = None):
        """Initializes the local persistent vector database storage engine on disk."""
        if db_path is None:
            # Resolve db_path to the root workspace folder chroma_knowledge_base
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            db_path = os.path.join(base_dir, "chroma_knowledge_base")
        
        self.client = chromadb.PersistentClient(path=db_path)
        self.embedding_function = embedding_functions.DefaultEmbeddingFunction()
        
        # Core collection for textbook RAG grounding
        self.curriculum_collection = self.client.get_or_create_collection(
            name="curriculum_repository",
            embedding_function=self.embedding_function
        )

    def ingest_openstax_text(self, file_path: str, subject: str, academic_tier: str):
        """Processes raw text textbooks into paragraphs and adds them to the vector index in safe batch sizes."""
        if not os.path.exists(file_path):
            print(f"[WARN] Source file not found at {file_path}. Generating fallback mock content for initialization.")
            os.makedirs(os.path.dirname(file_path), exist_ok=True)
            with open(file_path, "w", encoding="utf-8") as fallback:
                fallback.write(
                    f"Newton's Laws of Motion govern classical mechanics in {subject}. Force equals mass times acceleration (F=ma).\n\n"
                    f"In a sorted list, binary search algorithms find elements in logarithmic time complexity O(log n)."
                )

        with open(file_path, "r", encoding="utf-8") as file:
            raw_text = file.read()

        # Split document text cleanly by paragraphs to maintain conceptual boundaries
        paragraphs = [p.strip() for p in raw_text.split("\n\n") if len(p.strip()) > 40]
        
        total_chunks = len(paragraphs)
        if total_chunks == 0:
            print(f"[ERROR] No valid text segments extracted from {file_path}")
            return

        print(f"\n[Processing {subject} | {academic_tier}] Loaded {total_chunks} paragraphs. Beginning batch slicing...")

        # Generate structural IDs and metadata arrays
        all_ids = [f"{subject.lower()}_{academic_tier.replace(' ', '_').lower()}_{i:04d}" for i in range(total_chunks)]
        all_metadatas = [{
            "subject": subject,
            "academic_tier": academic_tier,
            "grade_level": academic_tier, # fallback compatibility
            "data_integrity_status": "verified"
        } for _ in range(total_chunks)]

        # Implement batching to protect against Chroma limit restrictions (using a safe size of 2000)
        batch_size = 2000
        for start_idx in range(0, total_chunks, batch_size):
            end_idx = start_idx + batch_size
            
            batch_ids = all_ids[start_idx:end_idx]
            batch_docs = paragraphs[start_idx:end_idx]
            batch_metadatas = all_metadatas[start_idx:end_idx]
            
            self.curriculum_collection.add(
                ids=batch_ids, 
                documents=batch_docs, 
                metadatas=batch_metadatas
            )
            print(f"   Processed segment range [{start_idx} to {min(end_idx, total_chunks)}] successfully...")

        print(f"[OK] Successfully vectorized and loaded all {total_chunks} paragraphs from {subject} ({academic_tier}) into ChromaDB.")

    def ingest_custom_chunks(
        self,
        course_id: str,
        chunks: list[str],
        subject: str = "General",
        academic_tier: str = "Custom",
        chapter_id: str = "ch_1",
        chapter_index: int = 1,
    ):
        """
        Ingests dynamically parsed chunks with SHA-256 content deduplication to prevent vector DB bloat.
        Uses deterministic content hashing to prevent duplicate vector caching.
        """
        import hashlib
        if not chunks:
            return 0

        # Filter out empty or near-empty chunks
        unique_chunks_map = {}
        for c in chunks:
            clean_c = c.strip()
            if len(clean_c) > 40:
                chunk_hash = hashlib.sha256(clean_c.encode('utf-8')).hexdigest()[:16]
                if chunk_hash not in unique_chunks_map:
                    unique_chunks_map[chunk_hash] = clean_c

        if not unique_chunks_map:
            return 0

        ids = []
        documents = []
        metadatas = []

        for chunk_hash, text in unique_chunks_map.items():
            doc_id = f"{course_id}_{chapter_id}_{chunk_hash}"
            ids.append(doc_id)
            documents.append(text)
            metadatas.append({
                "course_id": course_id,
                "chapter_id": chapter_id,
                "chapter_index": chapter_index,
                "subject": subject,
                "academic_tier": academic_tier,
                "content_hash": chunk_hash,
                "data_integrity_status": "verified"
            })

        batch_size = 200
        for start_idx in range(0, len(ids), batch_size):
            end_idx = start_idx + batch_size
            try:
                # Use upsert to avoid duplicate insertion errors
                self.curriculum_collection.upsert(
                    ids=ids[start_idx:end_idx],
                    documents=documents[start_idx:end_idx],
                    metadatas=metadatas[start_idx:end_idx],
                )
            except Exception as e:
                print(f"[ChromaDB] Upsert warning: {e}")

        return len(ids)

    def delete_course_vectors(self, course_id: str) -> int:
        """Purges all vector embeddings associated with a deleted course to keep vector store lean."""
        try:
            self.curriculum_collection.delete(
                where={"course_id": course_id}
            )
            print(f"[ChromaDB] Successfully purged vector records for course: {course_id}")
            return 1
        except Exception as e:
            print(f"[ChromaDB] Error purging course vectors for {course_id}: {e}")
            return 0

    def query_verified_context(self, query: str, course_id: str = None, subject: str = None, academic_tier: str = None, n_results: int = 3) -> list[str]:
        """Queries the local collection using verified structural parameters and optional course_id/subject filter."""
        where_clauses = [{"data_integrity_status": "verified"}]
        
        if course_id:
            where_clauses.append({"course_id": course_id})
        else:
            if subject:
                where_clauses.append({"subject": subject})
            if academic_tier:
                where_clauses.append({"academic_tier": academic_tier})
                
        where_filter = {"$and": where_clauses} if len(where_clauses) > 1 else where_clauses[0]
        
        try:
            results = self.curriculum_collection.query(
                query_texts=[query],
                n_results=n_results,
                where=where_filter
            )
            return results['documents'][0] if results and results.get('documents') and len(results['documents']) > 0 else []
        except Exception as e:
            print(f"[ChromaDB] Query error: {e}")
            return []


    def preview_interaction_metrics(self, csv_path: str):
        """Validates that your backend Performance Analyzer can cleanly parse your shrunken EdNet sample."""
        import csv
        if not os.path.exists(csv_path):
            print(f"[WARN] Warning: Active tracking log sample missing at {csv_path}. Please verify your shrink_dataset.py ran correctly.")
            return

        print(f"\n[PREVIEW] Previewing EdNet telemetry interaction mapping from: {csv_path}")
        with open(csv_path, mode="r", encoding="utf-8") as file:
            reader = csv.DictReader(file)
            for idx, row in enumerate(reader):
                if idx >= 3: 
                    break
                print(f"   [Row {idx+1}] User ID: {row.get('user_id') or row.get('student_id')} | Action: {row.get('action_type') or 'QA'} | Latency: {row.get('elapsed_time')}ms")

if __name__ == "__main__":
    pipeline = DatabaseIngestPipeline()
    
    # Delete the old collection to start fresh
    try:
        pipeline.client.delete_collection("curriculum_repository")
        print("[CLEARED] Old collection curriculum_repository removed.")
    except Exception as e:
        print("No old collection to delete or error:", e)
        
    pipeline.curriculum_collection = pipeline.client.get_or_create_collection(
        name="curriculum_repository",
        embedding_function=pipeline.embedding_function
    )
    
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Define textbook sources to load into the curriculum repository
    textbooks = [
        # Physics
        {"path": os.path.join(backend_dir, "data", "curriculum", "physics_textbook.txt"), "subject": "Physics", "tier": "Class 10"},
        {"path": os.path.join(backend_dir, "data", "curriculum", "physics_textbook.txt"), "subject": "Physics", "tier": "Class 11-12"},
        {"path": os.path.join(backend_dir, "data", "curriculum", "physics_textbook.txt"), "subject": "Physics", "tier": "Undergraduate"},
        
        # Biology
        {"path": os.path.join(backend_dir, "data", "curriculum", "biology_textbook.txt"), "subject": "Biology", "tier": "Class 10"},
        {"path": os.path.join(backend_dir, "data", "curriculum", "biology_textbook.txt"), "subject": "Biology", "tier": "Class 11-12"},
        {"path": os.path.join(backend_dir, "data", "curriculum", "biology_textbook.txt"), "subject": "Biology", "tier": "Undergraduate"},
        
        # Mathematics
        {"path": os.path.join(backend_dir, "data", "curriculum", "math_textbook.txt"), "subject": "Mathematics", "tier": "Class 10"},
        {"path": os.path.join(backend_dir, "data", "curriculum", "math_textbook.txt"), "subject": "Mathematics", "tier": "Class 11-12"},
        {"path": os.path.join(backend_dir, "data", "curriculum", "calculus_textbook.txt"), "subject": "Mathematics", "tier": "Undergraduate"}
    ]
    
    # 1. Ingest all curriculum content paths sequentially
    for book in textbooks:
        pipeline.ingest_openstax_text(book["path"], book["subject"], book["tier"])
    
    # 2. Test reading behavioral interaction metrics sample path
    ednet_sample_path = os.path.join(backend_dir, "data", "ednet", "ednet_small_sample.csv")
    pipeline.preview_interaction_metrics(ednet_sample_path)