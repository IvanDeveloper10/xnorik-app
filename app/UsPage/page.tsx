import { Fragment } from 'react';
import Image from 'next/image';
import { Card, CardHeader, CardBody, CardFooter } from '@heroui/card';
import { Avatar } from '@heroui/avatar';
import Footer from '@/components/Footer';
import { Divider } from '@heroui/divider';

export default function UsPage(): JSX.Element {
  const teamMembers = [
    {
      name: 'IVÁN PÉREZ',
      role: 'Desarrollo De Software',
      image: '/image-programmer.svg',
      alt: 'Image Programmer',
      description: 'Experto en programación de software con un enfoque logico, organizado y moderno.'
    },
    {
      name: 'LINDA PINEDA',
      role: 'Marketing Digital',
      image: '/image-marketing.svg',
      alt: 'Image Marketing',
      description: 'Estrategia de marketing digital enfocada en crecimiento y engagement de audiencia.'
    },
    {
      name: 'RONALD RODRIGUEZ',
      role: 'Administración De Dominio',
      image: '/image-admin-domain.svg',
      alt: 'Image Admin Domain',
      description: 'Auxiliar en gestión y administración de dominios y infraestructura web.'
    },
    {
      name: 'KEREN SALAS',
      role: 'Asesoria Legal',
      image: '/image-woman.svg',
      alt: 'Image Woman',
      description: 'Abogada especializada en derecho digital y protección de datos personales.'
    },
    {
      name: 'MARIA SALCEDO',
      role: 'Diseño Visual Y Grafico',
      image: '/image-designer.svg',
      alt: 'Image Designer',
      description: 'Diseñadora gráfica creativa con enfoque en experiencia de usuario y branding.'
    }
  ];

  return (
    <Fragment>
      <section className='w-full h-64 md:h-96 lg:h-screen flex justify-center items-start px-4'>
        <Image
          src={'/image-us.jpg'}
          alt={'Image Us'}
          width={900}
          height={900}
          className='rounded-3xl mt-4 md:mt-10 w-full max-w-4xl object-cover h-48 md:h-80 lg:h-[600px] shadow-2xl'
        />
      </section>

      <section className='w-full px-4 md:px-8 lg:px-16 py-8 md:py-16 bg-gradient-to-b from-white to-gray-50/50 text-po'>
        <main className='mb-8 md:mb-12 lg:mb-16 text-center'>
          <h1 className='text-po text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4'>
            NUESTRO EQUIPO DE XNORIK
          </h1>
          <p className='text-gray-600 text-lg md:text-xl max-w-2xl mx-auto'>
            Conoce al equipo de profesionales que hace posible nuestro éxito
          </p>
        </main>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto'>
          {teamMembers.map((member, index) => (
            <Card 
              key={index}
              className="w-full hover:shadow-xl transition-all duration-300 border-none bg-gradient-to-br from-white to-gray-50/50"
              isHoverable
            >
              <CardBody className="flex flex-row items-center gap-4 p-6">
                <Avatar
                  isBordered
                  color="secondary"
                  src={member.image}
                  className="w-16 h-16 flex-shrink-0"
                />
                <div className="flex flex-col text-left">
                  <h3 className="text-lg font-bold text-gray-800">
                    {member.name}
                  </h3>
                  <p className="text-sm text-default-500 font-medium">
                    {member.role}
                  </p>
                  <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                    {member.description}
                  </p>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>
      <Footer />
    </Fragment>
  );
}