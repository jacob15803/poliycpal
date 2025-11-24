"""
LLM Service - Configurable to use local models or OpenAI.
Easy to switch between local testing and OpenAI production.
"""
import os
from typing import List, Optional
from abc import ABC, abstractmethod

# Try to import OpenAI (optional)
try:
    from langchain_openai import ChatOpenAI
    from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False

# Try to import transformers for local models
try:
    from transformers import pipeline, AutoTokenizer, AutoModelForSeq2SeqLM
    import torch
    TRANSFORMERS_AVAILABLE = True
except ImportError:
    TRANSFORMERS_AVAILABLE = False


class LLMProvider(ABC):
    """Abstract base class for LLM providers."""
    
    @abstractmethod
    def generate(self, system_prompt: str, user_prompt: str) -> str:
        """Generate a response given system and user prompts."""
        pass


class LocalLLMProvider(LLMProvider):
    """Local model provider using DistilBART or similar for text generation."""
    
    def __init__(self, model_name: str = "sshleifer/distilbart-cnn-12-6"):
        """
        Initialize local model.
        
        Args:
            model_name: HuggingFace model name. Options:
                - "sshleifer/distilbart-cnn-12-6" (small, fast)
                - "facebook/bart-large-cnn" (better quality, slower)
                - "google/flan-t5-base" (instruction-tuned)
        """
        if not TRANSFORMERS_AVAILABLE:
            raise ImportError("transformers library not installed. Run: pip install transformers torch")
        
        print(f"Loading local model: {model_name}...")
        self.model_name = model_name
        
        # Use CPU for now (can switch to GPU if available)
        device = 0 if torch.cuda.is_available() else -1
        
        # Load model and tokenizer
        try:
            self.tokenizer = AutoTokenizer.from_pretrained(model_name)
            self.model = AutoModelForSeq2SeqLM.from_pretrained(model_name)
            if device >= 0:
                self.model = self.model.to(f"cuda:{device}")
            self.device = device
            print(f"Model loaded on {'GPU' if device >= 0 else 'CPU'}")
        except Exception as e:
            print(f"Error loading model: {e}")
            print("Falling back to simple template-based synthesis...")
            self.model = None
            self.tokenizer = None
    
    def generate(self, system_prompt: str, user_prompt: str) -> str:
        """Generate response using local model."""
        if self.model is None:
            # Fallback to simple template-based approach
            return self._template_based_synthesis(system_prompt, user_prompt)
        
        # Combine prompts
        full_prompt = f"{system_prompt}\n\n{user_prompt}"
        
        # For DistilBART, we'll use it for summarization/synthesis
        # Truncate if too long (DistilBART has 1024 token limit)
        max_length = 1024
        
        try:
            # Tokenize
            inputs = self.tokenizer(
                full_prompt,
                max_length=max_length,
                truncation=True,
                return_tensors="pt"
            )
            
            if self.device >= 0:
                inputs = {k: v.to(f"cuda:{self.device}") for k, v in inputs.items()}
            
            # Generate
            with torch.no_grad():
                outputs = self.model.generate(
                    **inputs,
                    max_length=512,
                    min_length=50,
                    num_beams=4,
                    early_stopping=True,
                    do_sample=False
                )
            
            # Decode
            response = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
            return response
        except Exception as e:
            print(f"Error in model generation: {e}")
            return self._template_based_synthesis(system_prompt, user_prompt)
    
    def _template_based_synthesis(self, system_prompt: str, user_prompt: str) -> str:
        """Simple template-based fallback when model fails."""
        # Extract key information from prompts
        if "IT Policy Expert" in system_prompt:
            # IT Expert template
            if "No IT policy context" in user_prompt or "No IT policy context available" in user_prompt:
                return "Based on the IT policy context provided, I cannot find specific information related to this question in the IT policies. Please consult the IT department for clarification."
            
            # Extract context from user prompt
            if "IT Policy Context:" in user_prompt:
                context_start = user_prompt.find("IT Policy Context:") + len("IT Policy Context:")
                context = user_prompt[context_start:].split("\n\nProvide")[0].strip()
                question_start = user_prompt.find("Question:") + len("Question:")
                question = user_prompt[question_start:].split("\n\nIT Policy Context:")[0].strip()
                
                return f"Based on the IT policy context provided:\n\n{context[:500]}\n\nAnswer: The IT policy information above addresses aspects of your question about '{question}'. Please review the specific policy details mentioned."
            
            return f"Based on the IT policy context provided, here is the relevant information: {user_prompt[:300]}..."
        
        elif "HR Policy Expert" in system_prompt:
            # HR Expert template
            if "No HR policy context" in user_prompt or "No HR policy context available" in user_prompt:
                return "Based on the HR policy context provided, I cannot find specific information related to this question in the HR policies. Please consult the HR department for clarification."
            
            # Extract context from user prompt
            if "HR Policy Context:" in user_prompt:
                context_start = user_prompt.find("HR Policy Context:") + len("HR Policy Context:")
                context = user_prompt[context_start:].split("\n\nProvide")[0].strip()
                question_start = user_prompt.find("Question:") + len("Question:")
                question = user_prompt[question_start:].split("\n\nHR Policy Context:")[0].strip()
                
                return f"Based on the HR policy context provided:\n\n{context[:500]}\n\nAnswer: The HR policy information above addresses aspects of your question about '{question}'. Please review the specific policy details mentioned."
            
            return f"Based on the HR policy context provided, here is the relevant information: {user_prompt[:300]}..."
        
        elif "Coordinator" in system_prompt:
            # Coordinator synthesis template - extract expert responses
            if "IT Policy Expert's Analysis:" in user_prompt and "HR Policy Expert's Analysis:" in user_prompt:
                it_start = user_prompt.find("IT Policy Expert's Analysis:") + len("IT Policy Expert's Analysis:")
                hr_start = user_prompt.find("HR Policy Expert's Analysis:")
                it_response = user_prompt[it_start:hr_start].strip()
                hr_response = user_prompt[hr_start + len("HR Policy Expert's Analysis:"):].split("\n\nPlease synthesize")[0].strip()
                
                question_start = user_prompt.find("Original Question:") + len("Original Question:")
                question = user_prompt[question_start:].split("\n\nIT Policy Expert's Analysis:")[0].strip()
                
                return f"""Based on the analysis from both IT and HR policy experts, here is a comprehensive answer to your question: "{question}"

IT Policy Perspective:
{it_response[:400]}...

HR Policy Perspective:
{hr_response[:400]}...

Synthesized Answer: This question involves both IT and HR policy considerations. The IT policy expert has provided technical and security-related information, while the HR policy expert has addressed employee-related aspects. Please review both perspectives above for a complete understanding of the policy requirements."""
            
            return "Based on the analysis from both IT and HR policy experts, here is a comprehensive answer that synthesizes both perspectives. Please review the expert analyses provided above for complete information."
        
        return "I'm processing your request. [Local model response - switch to OpenAI for better quality]"


class OpenAIProvider(LLMProvider):
    """OpenAI provider using GPT-4o."""
    
    def __init__(self, api_key: Optional[str] = None, model: str = "gpt-4o"):
        if not OPENAI_AVAILABLE:
            raise ImportError("langchain-openai not installed. Run: pip install langchain-openai")
        
        api_key = api_key or os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY environment variable is required")
        
        self.llm = ChatOpenAI(
            model=model,
            temperature=0.3,
            api_key=api_key
        )
    
    def generate(self, system_prompt: str, user_prompt: str) -> str:
        """Generate response using OpenAI."""
        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=user_prompt)
        ]
        response = self.llm.invoke(messages)
        return response.content


def get_llm_provider() -> LLMProvider:
    """
    Get LLM provider based on environment configuration.
    
    Environment variables:
    - LLM_PROVIDER: "local" (default) or "openai"
    - LOCAL_MODEL_NAME: HuggingFace model name (default: "sshleifer/distilbart-cnn-12-6")
    - OPENAI_API_KEY: Required if using OpenAI
    - OPENAI_MODEL: Model name (default: "gpt-4o")
    """
    provider = os.getenv("LLM_PROVIDER", "local").lower()
    
    if provider == "openai":
        if not OPENAI_AVAILABLE:
            print("Warning: OpenAI not available, falling back to local model")
            provider = "local"
        else:
            model = os.getenv("OPENAI_MODEL", "gpt-4o")
            return OpenAIProvider(model=model)
    
    # Default to local
    model_name = os.getenv("LOCAL_MODEL_NAME", "sshleifer/distilbart-cnn-12-6")
    return LocalLLMProvider(model_name=model_name)

