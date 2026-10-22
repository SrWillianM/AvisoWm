import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import AvisoCard from '../../components/AvisoCard';

describe('AvisoCard Component', () => {
  const avisoGeneralMock = {
    id_aviso: 1,
    titulo: 'Comunicado General Institucional',
    contenido: 'Convocatoria general para toda la comunidad educativa.',
    fecha_publicacion: '2026-10-22T10:00:00Z',
    tipo_aviso: 'General',
    estado_activo: true,
    autor: { nombre_completo: 'Lic. Director Institucional', rol: 'Administrador' },
    curso_nombre: null,
  };

  const avisoEspecificoMock = {
    id_aviso: 2,
    titulo: 'Reunión 3.° Grado Sección A',
    contenido: 'Convocatoria a padres para entrega de boletines.',
    fecha_publicacion: '2026-10-22T11:00:00Z',
    tipo_aviso: 'Especifico',
    estado_activo: true,
    autor: { nombre_completo: 'Prof. Carlos Ramírez', rol: 'Profesor' },
    curso_nombre: '3.° Grado A — Mañana',
  };

  it('renderiza correctamente un aviso de tipo General con su badge institucional', () => {
    render(<AvisoCard aviso={avisoGeneralMock} />);
    expect(screen.getByText('Comunicado General Institucional')).toBeInTheDocument();
    expect(screen.getByText('GENERAL')).toBeInTheDocument();
    expect(screen.getByText('Lic. Director Institucional')).toBeInTheDocument();
  });

  it('renderiza correctamente un aviso Específico mostrando el nombre del curso', () => {
    render(<AvisoCard aviso={avisoEspecificoMock} />);
    expect(screen.getByText('Reunión 3.° Grado Sección A')).toBeInTheDocument();
    expect(screen.getByText('ESPECÍFICO')).toBeInTheDocument();
    expect(screen.getByText('3.° Grado A — Mañana')).toBeInTheDocument();
  });
});
