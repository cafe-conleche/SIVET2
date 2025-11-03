import type { Schema, Struct } from '@strapi/strapi';

export interface PersonasPersona extends Struct.ComponentSchema {
  collectionName: 'components_personas_personas';
  info: {
    displayName: 'Persona';
  };
  attributes: {
    activo: Schema.Attribute.Boolean;
    apellidos: Schema.Attribute.String;
    cedula: Schema.Attribute.String;
    email: Schema.Attribute.Email;
    fecha_nacimiento: Schema.Attribute.Date;
    nombre: Schema.Attribute.String;
    telefono: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'personas.persona': PersonasPersona;
    }
  }
}
