"""
Agentic debate system using LangGraph.
Implements IT Expert, HR Expert, and Coordinator agents.
"""
import os
from typing import Dict, List
from pydantic import BaseModel

from services.rag_service import RAGService
from services.llm_service import get_llm_provider


class DebateState(BaseModel):
    """State shared between agents in the debate system."""
    question: str
    it_context: List[str]
    hr_context: List[str]
    it_expert_response: str = ""
    hr_expert_response: str = ""
    final_answer: str = ""
    sources: List[str] = []


class AgenticDebateService:
    """
    Orchestrates a multi-agent debate system:
    1. IT Policy Expert retrieves and analyzes IT policy chunks
    2. HR Policy Expert retrieves and analyzes HR policy chunks
    3. Coordinator synthesizes both perspectives into final answer
    """
    
    def __init__(self):
        self.rag_service = RAGService()
        
        # Initialize LLM provider (local by default, OpenAI if configured)
        # Set LLM_PROVIDER=openai in .env to use OpenAI
        # Set LLM_PROVIDER=local (or leave unset) to use local model
        self.llm = get_llm_provider()
    
    async def process_query(self, question: str) -> Dict:
        """
        Process a user query through the agentic debate system.
        
        Args:
            question: User's policy question
        
        Returns:
            Dict with answer, contexts, and sources
        """
        # Initialize state
        state = DebateState(question=question)
        
        # Step 1: Retrieve relevant chunks from all policy areas
        all_chunks = self.rag_service.retrieve_from_all_areas(question, top_k_per_area=5)
        
        # Extract IT and HR contexts
        state.it_context = [
            chunk["text"] for chunk in all_chunks.get("IT", [])
        ]
        state.hr_context = [
            chunk["text"] for chunk in all_chunks.get("HR", [])
        ]
        
        # Collect sources
        state.sources = []
        for area_chunks in all_chunks.values():
            for chunk in area_chunks:
                if chunk.get("metadata", {}).get("filename"):
                    filename = chunk["metadata"]["filename"]
                    if filename not in state.sources:
                        state.sources.append(filename)
        
        # Step 2: IT Expert analyzes IT policy context
        state.it_expert_response = await self._it_expert_agent(state)
        
        # Step 3: HR Expert analyzes HR policy context
        state.hr_expert_response = await self._hr_expert_agent(state)
        
        # Step 4: Coordinator synthesizes final answer
        state.final_answer = await self._coordinator_agent(state)
        
        return {
            "answer": state.final_answer,
            "it_context": state.it_context,
            "hr_context": state.hr_context,
            "sources": state.sources,
            "it_expert_response": state.it_expert_response,
            "hr_expert_response": state.hr_expert_response
        }
    
    async def _it_expert_agent(self, state: DebateState) -> str:
        """IT Policy Expert agent analyzes IT policy context."""
        context_text = "\n\n".join(state.it_context) if state.it_context else "No IT policy context available."
        
        system_prompt = """You are an IT Policy Expert. Your role is to analyze IT policy documents and provide clear, accurate answers based solely on the IT policy information provided.

Guidelines:
- Base your answer ONLY on the IT policy context provided
- Be specific and cite relevant policy details
- If the question is not related to IT policies, state that clearly
- If the context doesn't contain enough information, say so
- Focus on technical policies, security, devices, software, and IT procedures"""
        
        user_prompt = f"Question: {state.question}\n\nIT Policy Context:\n{context_text}\n\nProvide your analysis and answer based on the IT policy context."
        
        response = self.llm.generate(system_prompt, user_prompt)
        return response
    
    async def _hr_expert_agent(self, state: DebateState) -> str:
        """HR Policy Expert agent analyzes HR policy context."""
        context_text = "\n\n".join(state.hr_context) if state.hr_context else "No HR policy context available."
        
        system_prompt = """You are an HR Policy Expert. Your role is to analyze HR policy documents and provide clear, accurate answers based solely on the HR policy information provided.

Guidelines:
- Base your answer ONLY on the HR policy context provided
- Be specific and cite relevant policy details
- If the question is not related to HR policies, state that clearly
- If the context doesn't contain enough information, say so
- Focus on employee benefits, leave policies, workplace conduct, training, and HR procedures"""
        
        user_prompt = f"Question: {state.question}\n\nHR Policy Context:\n{context_text}\n\nProvide your analysis and answer based on the HR policy context."
        
        response = self.llm.generate(system_prompt, user_prompt)
        return response
    
    async def _coordinator_agent(self, state: DebateState) -> str:
        """Coordinator agent synthesizes IT and HR expert responses into final answer."""
        system_prompt = """You are a Policy Coordinator. Your role is to synthesize information from IT and HR policy experts to provide a comprehensive, unified answer to the user's question.

Guidelines:
- Combine insights from both IT and HR experts
- Identify any overlaps, conflicts, or nuances between the two perspectives
- Provide a clear, comprehensive answer that addresses all aspects of the question
- If there are conflicts, acknowledge them and explain the different perspectives
- Structure your answer clearly and make it easy to understand
- Ensure the final answer is complete and addresses the user's question fully"""
        
        user_prompt = f"""Original Question: {state.question}

IT Policy Expert's Analysis:
{state.it_expert_response}

HR Policy Expert's Analysis:
{state.hr_expert_response}

Please synthesize these two expert perspectives into a comprehensive final answer that addresses the user's question. Identify any nuances, overlaps, or conflicts between the IT and HR perspectives."""
        
        response = self.llm.generate(system_prompt, user_prompt)
        return response

