import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { AuthProvider } from '../../store/authStore';
import Login from '../../pages/Login';

describe('Login Page', () => {
  it('renderiza el formulario con campos de cédula y contraseña', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByLabelText(/Cédula de Identidad/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Iniciar Sesión/i })).toBeInTheDocument();
  });

  it('permite al usuario escribir en los campos de entrada', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    );

    const cedulaInput = screen.getByLabelText(/Cédula de Identidad/i);
    const passInput = screen.getByLabelText(/Contraseña/i);

    fireEvent.change(cedulaInput, { target: { value: '1234567' } });
    fireEvent.change(passInput, { target: { value: 'Secret123!' } });

    expect(cedulaInput.value).toBe('1234567');
    expect(passInput.value).toBe('Secret123!');
  });
});
