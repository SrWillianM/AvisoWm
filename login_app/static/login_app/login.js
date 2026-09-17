const form = document.querySelector('#login-form');
const cedulaInput = document.querySelector('#cedula');
const passwordInput = document.querySelector('#password');
const message = document.querySelector('#form-message');
const submitButton = document.querySelector('#submit-button');
const togglePassword = document.querySelector('#toggle-password');

togglePassword.addEventListener('click', () => {
    const showing = passwordInput.type === 'text';
    passwordInput.type = showing ? 'password' : 'text';
    togglePassword.setAttribute(
        'aria-label',
        showing ? 'Mostrar contraseña' : 'Ocultar contraseña',
    );
});

form.addEventListener('submit', async (event) => {
    event.preventDefault();
    message.textContent = '';
    message.classList.remove('success');

    if (!cedulaInput.value.trim() || !passwordInput.value) {
        message.textContent = 'Completa tu cédula y contraseña para continuar.';
        return;
    }

    submitButton.disabled = true;
    submitButton.querySelector('span').textContent = 'Validando...';

    try {
        const response = await fetch('/api/auth/login/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                cedula: cedulaInput.value.trim(),
                password: passwordInput.value,
            }),
        });
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'No fue posible iniciar sesión.');
        }

        message.textContent = `Bienvenido. Cédula: ${data.usuario.cedula}.`;
        message.classList.add('success');
    } catch (error) {
        message.textContent = error.message;
    } finally {
        submitButton.disabled = false;
        submitButton.querySelector('span').textContent = 'Entrar al portal';
    }
});