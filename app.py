import streamlit as st
import google.generativeai as genai

# --- CONFIGURACIÓN ---
API_KEY = "AIzaSyBUTy7W9d8VGfZ7tjI5icVw9pmUqjZa0WI" 
genai.configure(api_key=API_KEY)
MODEL_ID = 'gemini-1.5-pro'

# --- DISEÑO ESTILO "BYTE AI" (CSS) ---
st.markdown("""
    <style>
    .main {
        background-color: #0d1117;
        color: #ffffff;
    }
    .stButton>button {
        width: 100%;
        border-radius: 10px;
        background-color: #161b22;
        color: #00ff88;
        border: 1px solid #30363d;
        height: 3em;
    }
    .stButton>button:hover {
        border-color: #00ff88;
        color: #ffffff;
    }
    h1 {
        color: #00ff88 !important;
        text-align: center;
    }
    .subtitle {
        text-align: center;
        color: #8b949e;
        margin-bottom: 20px;
    }
    </style>
    """, unsafe_allow_html=True)

# --- CEREBRO DE LA APP ---
SYSTEM_PROMPT = """Eres BYTE AI de 'BYTE COMPUTADORAS'. 
Eres un experto en soporte técnico. Tu estilo es moderno, rápido y profesional.
Ayudas con Diagnósticos, PC Lenta e Internet."""

model = genai.GenerativeModel(model_name=MODEL_ID, system_instruction=SYSTEM_PROMPT)

# --- INTERFAZ VISUAL ---
st.markdown("<h1>BYTE COMPUTADORAS</h1>", unsafe_allow_html=True)
st.markdown("<p class='subtitle'>SMART SUPPORT AI</p>", unsafe_allow_html=True)

# Simulación de los botones de tu foto original
st.write("### Acciones Rápidas")
col1, col2, col3 = st.columns(3)

with col1:
    if st.button("🔍 Diagnóstico"):
        st.session_state.messages.append({"role": "user", "content": "Realiza un diagnóstico de mi PC"})
with col2:
    if st.button("⚡ PC Lenta"):
        st.session_state.messages.append({"role": "user", "content": "Mi computadora está muy lenta"})
with col3:
    if st.button("🌐 Internet"):
        st.session_state.messages.append({"role": "user", "content": "Tengo problemas de internet"})

# --- CHAT ---
if "messages" not in st.session_state:
    st.session_state.messages = []

for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])

if prompt := st.chat_input("Describe tu problema aquí..."):
    st.session_state.messages.append({"role": "user", "content": prompt})
    with st.chat_message("user"):
        st.markdown(prompt)

    try:
        response = model.generate_content(prompt)
        with st.chat_message("assistant"):
            st.markdown(response.text)
        st.session_state.messages.append({"role": "assistant", "content": response.text})
    except Exception as e:
        st.error(f"Error: {e}")
