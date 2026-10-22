import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import Cartelera from '../../pages/Cartelera';
import AuthContext from '../../store/authStore';
import client from '../../api/client';

vi.mock('../../api/client');

describe('Cartelera Page — Rol Padre', () => {
  const mockPadreUser = {
    id_usuario: 3,
    nombre_completo: 'Willian Medina (Tutor)',
    rol: 'Padre',
  };

  const mockVinculos = [
    {
      id_padre_curso: 1,
      id_usuario: 3,
      id_curso: 1,
      nombre_hijo: 'Lucas Medina',
      curso_detalle: {
        id_curso: 1,
        grado_curso: '3.° Grado',
        seccion: 'A',
        turno: 'Mañana',
      },
    },
    {
      id_padre_curso: 2,
      id_usuario: 3,
      id_curso: 2,
      nombre_hijo: 'Sofía Medina',
      curso_detalle: {
        id_curso: 2,
        grado_curso: '6.° Grado',
        seccion: 'B',
        turno: 'Mañana',
      },
    },
  ];

  const mockAvisos = [
    {
      id_aviso: 1,
      titulo: 'Aviso General de Apertura',
      contenido: 'Para todos.',
      tipo_aviso: 'General',
      estado_activo: true,
      fecha_publicacion: '2026-10-22T08:00:00Z',
    },
    {
      id_aviso: 2,
      titulo: 'Tarea 3.° Grado A',
      contenido: 'Solo para Lucas.',
      tipo_aviso: 'Especifico',
      id_curso: 1,
      estado_activo: true,
      fecha_publicacion: '2026-10-22T09:00:00Z',
    },
  ];

  it('permite al padre ver las pestañas por cada uno de sus hijos vinculados', async () => {
    client.get.mockImplementation((url) => {
      if (url === '/mis-cursos/') return Promise.resolve({ data: { results: mockVinculos } });
      if (url === '/cursos/') return Promise.resolve({ data: { results: [] } });
      if (url === '/avisos/') return Promise.resolve({ data: { results: mockAvisos } });
      return Promise.resolve({ data: [] });
    });

    render(
      <BrowserRouter>
        <AuthContext.Provider value={{ user: mockPadreUser, isAuthenticated: true, loading: false }}>
          <Cartelera />
        </AuthContext.Provider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Lucas Medina: 3.° Grado "A"/i)).toBeInTheDocument();
      expect(screen.getByText(/Sofía Medina: 6.° Grado "B"/i)).toBeInTheDocument();
      expect(screen.getByText(/Todos mis hijos/i)).toBeInTheDocument();
    });
  });
});
