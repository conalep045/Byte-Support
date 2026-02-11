import streamlit as st
import google.generativeai as genai

# Configuración de la página
st.set_page_config(page_title="Mi IA Independiente", page_icon="🤖")

# --- ESTILOS PERSONALIZADOS ---
st.markdown("""
    <style>
    .main { background-color: #f5f7f9; }
    .stTextInput { border-radius: 20px; }
    </style>
    """, unsafe_allow_html=True)

st.title("🤖 Mi Asistente Personal")
st.caption("Desarrollado con Gemini API - Acceso Libre")

# --- LÓGICA DE LA API ---
# Aquí es donde pegas tu API Key de Google AI Studio
API_KEY = "TU_API_KEY_AQUI" 

if API_KEY == "TU_API_KEY_AQUI":
    st.error("Por favor, introduce tu API Key en el código.")
else:
    genai.configure(api_key=API_KEY)
    model = genai.GenerativeModel('gemini-1.5-flash')

    # Historial de chat
    if "messages" not in st.session_state:
        st.session_state.messages = []

    # Mostrar mensajes previos
    for message in st.session_state.messages:
        with st.chat_message(message["role"]):
            st.markdown(message["content"])

    # Entrada del usuario
    if prompt := st.chat_input("¿En qué puedo ayudarte hoy?"):
        st.session_state.messages.append({"role": "user", "content": prompt})
        with st.chat_message("user"):
            st.markdown(prompt)

        with st.chat_message("assistant"):
            message_placeholder = st.empty()
            try:
                response = model.generate_content(prompt)
                full_response = response.text
                message_placeholder.markdown(full_response)
                st.session_state.messages.append({"role": "assistant", "content": full_response})
            except Exception as e:
                st.error(f"Error: {e}")