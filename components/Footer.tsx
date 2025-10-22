import { Fragment } from 'react';
import Link from 'next/link';

export default function Footer(): JSX.Element {
  return (
    <Fragment>
      <footer className='w-full flex flex-col justify-around text-po py-10 bg-black text-white'>
        <div className='flex justify-around w-full'>
          <div>
            <h2 className='font-bold'>INFORMACION</h2>
            <ul>
              <Link href={'/About'}><li>Acerca</li></Link>
              <Link href={'/UsPage'}><li>Nosotros</li></Link>
              <Link href={'/Company'}><li>Compañia</li></Link>
            </ul>
          </div>
          <div>
            <h2 className='font-bold'>SOLUCIONES</h2>
            <ul>
              <Link href={'mailto:xnorik.email@gmail.com'}><li>Correo Electronico</li></Link>
              <Link href={'https://wa.me/573330509919'}><li>Whattsap</li></Link>
            </ul>
          </div>
          <div>
            <div>
              <h2 className='font-bold'>RECURSOS QUE USAMOS</h2>
              <ul>
                <Link href={'https://firebase.google.com/'}><li>Firebase</li></Link>
                <Link href={'https://www.manypixels.co/'}><li>Manypixels</li></Link>
                <Link href={'https://vercel.com/'}><li>Vercel</li></Link>
              </ul>
            </div>
          </div>
          <div>

          </div>
        </div>
        <div className='w-full flex justify-center items-center my-20'>
          xnorik - 2025
        </div>
      </footer>
    </Fragment>
  );
}