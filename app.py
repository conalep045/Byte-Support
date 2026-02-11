import streamlit as st
import google.generativeai as genai

# --- 1. CONFIGURACIÓN ---
# Asegúrate de que tu API KEY esté entre las comillas
API_KEY = "AIzaSyBUTy7W9d8VGfZ7tjI5icVw9pmUqjZa0WI" 

genai.configure(api_key=API_KEY)

# Cambiamos al modelo Pro
MODEL_ID = 'gemini-1.5-pro' 

# --- 2. PERSONALIDAD DE TU APP ---
INSTRUCCIONES_DE_SISTEMA = """
Eres BYTE AI, el asistente experto de 'BYTE COMPUTADORAS'. 
Tu objetivo es dar soporte técnico de alta calidad.
Eres profesional, eficiente y conoces mucho sobre hardware, software y redes.
"""

# --- 3. INICIALIZACIÓN ---
st.set_page_config(page_title="Byte-SoportePC", page_icon="💻")
st.title("🤖 BYTE AI - Versión Pro")

# Configurar el modelo con las instrucciones
model = genai.GenerativeModel(
    model_name=MODEL_ID,
    system_instruction=INSTRUCCIONES_DE_SISTEMA
)

# Historial de chat
if "messages" not in st.session_state:
    st.session_state.messages = []

# Mostrar mensajes
for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])

# --- 4. LÓGICA DE RESPUESTA ---
if prompt := st.chat_input("¿En qué puedo ayudarte hoy?"):
    st.session_state.messages.append({"role": "user", "content": prompt})
    with st.chat_message("user"):
        st.markdown(prompt)

    try:
        # Generar respuesta con el modelo Pro
        response = model.generate_content(prompt)
        
        # Extraer el texto de forma segura
        respuesta_texto = response.text
        
        with st.chat_message("assistant"):
            st.markdown(respuesta_texto)
        st.session_state.messages.append({"role": "assistant", "content": respuesta_texto})
        
    except Exception as e:
        st.error(f"Hubo un problema: {e}")
        st.info("Si el error persiste, verifica que tu API Key tenga permisos para Gemini Pro.")
