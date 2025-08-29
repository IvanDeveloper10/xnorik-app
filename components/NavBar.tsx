'use client'

import { Fragment, useState, useEffect } from 'react';
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, NavbarMenuToggle, NavbarMenu, NavbarMenuItem } from '@heroui/navbar';
import { Button } from '@heroui/button';
import { Image } from '@heroui/image';
import Link from 'next/link';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { app } from '@/utils/firebase';


export default function NavBar() {

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, [auth]);

  return (
    <Fragment>
      <Navbar isBlurred isMenuOpen={isMenuOpen} onMenuOpenChange={setIsMenuOpen} className='w-full flex px-10 bg-slate-50 text-po'>
        <NavbarContent className='sm:hidden' justify='start'>
          <NavbarMenuToggle aria-label={isMenuOpen ? 'Close menu' : 'Open menu'} />
        </NavbarContent>

        <NavbarContent className='sm:hidden pr-3' justify='center'>
          <NavbarBrand>
            <Image src='/xnorik-logo.png' width={100} />
          </NavbarBrand>
        </NavbarContent>

        <NavbarContent className='hidden sm:flex gap-7' justify='center'>
          <NavbarBrand>
            <Image src='/xnorik-logo.png' width={100} />
          </NavbarBrand>
          <NavbarItem>
            <Link href='/' className='flex justify-center items-center gap-1'><i className='fi fi-rr-home flex justify-center items-center'></i>Inicio</Link>
          </NavbarItem>
          <NavbarItem>
            <Link href='/About' className='flex justify-center items-center gap-1'><i className='fi fi-rr-info flex justify-center items-center'></i>Acerca</Link>
          </NavbarItem>
        </NavbarContent>

        {!user && (
          <NavbarContent justify='end' className='hidden sm:flex'>
            <NavbarItem>
              <Link href={'/Register'}>
                <Button color='primary' variant='ghost' radius='lg'>Registrarse</Button>
              </Link>
            </NavbarItem>
            <NavbarItem>
              <Link href={'/Login'}>
                <Button color='primary' variant='solid' radius='lg'>Iniciar Sesion</Button>
              </Link>
            </NavbarItem>
          </NavbarContent>
        )}

        <NavbarMenu>
          
        </NavbarMenu>
      </Navbar>
    </Fragment>
  );
}