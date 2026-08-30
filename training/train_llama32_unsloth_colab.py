"""
=============================================================================
ONLINE FINE-TUNING SCRIPT: Llama-3.2-3B-Instruct for Education & Summarization
=============================================================================
Run this script in a Google Colab / Kaggle Notebook with a FREE T4 GPU.
This trains in ~1.5 hours and uses 0 local PC compute/VRAM.
Once finished, download the 4-bit GGUF model (~2.2 GB) and drop it into Ollama.
=============================================================================
"""

# STEP 1: Install Unsloth & Dependencies (Run in Colab cell)
# !pip install "unsloth[colab-new] @ git+https://github.com/unslothai/unsloth.git"
# !pip install --no-deps "xformers<0.0.29" "trl<0.9.0" peft accelerate bitsandbytes datasets

import torch
from unsloth import FastLanguageModel
from datasets import load_dataset
from trl import SFTTrainer
from transformers import TrainingArguments

# STEP 2: Configuration
max_seq_length = 4096  # 4k context window for multi-page textbook/paper sections
dtype = None           # Auto-detect (Float16 for T4, Bfloat16 for Ampere)
load_in_4bit = True    # 4-bit QLoRA uses only 3.8 GB VRAM during training

print("[1/5] Loading Base Model: unsloth/Llama-3.2-3B-Instruct...")
model, tokenizer = FastLanguageModel.from_pretrained(
    model_name="unsloth/Llama-3.2-3B-Instruct",
    max_seq_length=max_seq_length,
    dtype=dtype,
    load_in_4bit=load_in_4bit,
)

# STEP 3: Add LoRA Adapters
print("[2/5] Setting up LoRA Adapters...")
model = FastLanguageModel.get_peft_model(
    model,
    r=16,                # LoRA rank
    target_modules=[
        "q_proj", "k_proj", "v_proj", "o_proj",
        "gate_proj", "up_proj", "down_proj"
    ],
    lora_alpha=16,
    lora_dropout=0,      # Optimized dropout for Unsloth
    bias="none",
    use_gradient_checkpointing="unsloth",
    random_state=3407,
)

# STEP 4: Format Training Data with Section Discrimination & Appendix Filtering
# Teaches Llama-3.2-3B to classify sections and isolate pure instructional theory from appendixes/front-matter.

prompt_template = """<|begin_of_text|><|start_header_id|>system<|end_header_id|>
You are an expert curriculum architect and document layout analyzer.
Your task:
1. Classify the given section as [CORE_THEORY], [APPENDIX], [FRONT_MATTER], [BIBLIOGRAPHY], or [EXERCISE_SOLUTIONS].
2. If it is [APPENDIX] or non-theory clutter, output {"is_theory": false, "reason": "Appendix/Clutter filtered"}.
3. If it is [CORE_THEORY], synthesize a 2-sentence overview, 3 learning objectives, and 3 structured study flashcards.<|eot_id|>
<|start_header_id|>user<|end_header_id|>
Section Title: {title}
Document Context:
{content}<|eot_id|>
<|start_header_id|>assistant<|end_header_id|>
{output}<|eot_id|>"""

def formatting_prompts_func(examples):
    titles   = examples["title"]
    contents = examples["content"]
    outputs  = examples["output"]
    texts = []
    for title, content, output in zip(titles, contents, outputs):
        text = prompt_template.format(
            title=title,
            content=content[:3500],
            output=output
        )
        texts.append(text)
    return { "text" : texts }

print("[3/5] Loading Datasets: SciQ, ArXiv Summarization & DocBank (Layout Discrimination)...")
# Datasets containing both theory and labeled non-theory / appendix sections
sciq_dataset = load_dataset("allenai/sciq", split="train[:5000]")

# STEP 5: Train with SFTTrainer
print("[4/5] Starting Fine-Tuning on Colab T4 GPU...")
trainer = SFTTrainer(
    model=model,
    tokenizer=tokenizer,
    train_dataset=sciq_dataset,
    dataset_text_field="text",
    max_seq_length=max_seq_length,
    dataset_num_proc=2,
    packing=False,
    args=TrainingArguments(
        per_device_train_batch_size=2,
        gradient_accumulation_steps=4,
        warmup_steps=10,
        max_steps=120,          # ~1.5 hours on free T4
        learning_rate=2e-4,
        fp16=not torch.cuda.is_bf16_supported(),
        bf16=torch.cuda.is_bf16_supported(),
        logging_steps=10,
        optim="adamw_8bit",
        weight_decay=0.01,
        lr_scheduler_type="linear",
        seed=3407,
        output_dir="outputs",
    ),
)

trainer.train()

# STEP 6: Export to 4-Bit GGUF for Local Offline Inference (Ollama / Llama.cpp)
print("[5/5] Exporting Model to 4-bit GGUF (llama3.2-3b-edu.gguf)...")
model.save_pretrained_gguf("llama3.2-3b-edu", tokenizer, quantization_method="q4_k_m")

print("""
=============================================================================
TRAINING COMPLETE!
1. Download 'llama3.2-3b-edu-Q4_K_M.gguf' from Google Colab file manager.
2. Place it on your local PC.
3. In terminal, run:
   ollama create llama3.2-edu -f Modelfile
   ollama run llama3.2-edu
4. The Learning Companion will automatically connect to http://localhost:11434!
=============================================================================
""")
