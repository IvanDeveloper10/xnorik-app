import { Fragment } from 'react';
import Image from 'next/image';

export default function AboutPage(): JSX.Element {
  return (
    <Fragment>
      <section className='w-full h-screen bg-black rounded-4xl flex justify-around items-center'>
        <div className='w-2/4 flex justify-center items-center flex-col gap-10 px-5 max-md:w-full'>
          <h1 className='text-white text-po font-bold text-5xl text-center'>¿QUE ES XNORIK?</h1>
          <Image src={'/image-call.svg'} className='flex min-md:hidden' width={500} height={400} alt={'Image Call'} />
          <p className='w-full text-white text-po font-light'>Xnorik, es un servicio web que prioriza la comunicación entre un técnico de reparación y su respectivo cliente, brindando confianza y seguridad.</p>
        </div>
        <div className='2/4 max-md:hidden'>
          <Image src={'/image-call.svg'} width={500} height={400} alt={'Image Call'}/>
        </div>
      </section>
    </Fragment>
  );
}