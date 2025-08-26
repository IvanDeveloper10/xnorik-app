'use client'

import { Fragment, useEffect } from 'react';
import { Input } from '@heroui/input';
import { Button } from '@heroui/button';
import Image from 'next/image';

export default function HomePage(): JSX.Element {

  return (
    <Fragment>
      <section className='h-screen rounded-xl w-full flex justify-center gap-10 p-10'>
        <main className='mt-10 flex flex-col gap-10 text-po w-2/4'>
          <h1 className='font-extrabold text-4xl text-po'>SIGA EL ESTADO DE SU <i className='bg-blue-500 px-5 rounded-xl text-white'>COMPUTADORA</i></h1>
          <label className='flex'>
            <Input label={'Ingrese El Ticket'} color='primary' radius='none' />
            <Button color='primary' radius='none' className='h-full flex justify-center items-center gap-1'><i className='fi fi-rr-search flex justify-center items-ceter'></i>Seguir</Button>
          </label>
        </main>
        <div>
          <Image src={'/image-track.svg'} alt={'Image Track'} width={400} height={400}></Image>
        </div>
      </section>
    </Fragment>
  );
}