'use client'

import { Fragment, useState } from 'react';
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, NavbarMenuToggle, NavbarMenu, NavbarMenuItem } from '@heroui/navbar';
import { Button } from '@heroui/button';
import { Image } from '@heroui/image';
import Link from 'next/link';



export default function NavBar() {

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <Fragment>
      <Navbar isBordered isMenuOpen={isMenuOpen} onMenuOpenChange={setIsMenuOpen} className='px-10'>
        <NavbarContent className='sm:hidden' justify='start'>
          <NavbarMenuToggle aria-label={isMenuOpen ? "Close menu" : "Open menu"} />
        </NavbarContent>

        <NavbarContent className='sm:hidden pr-3' justify='center'>
          <NavbarBrand>
            <Image src='/xnorik-logo.png' width={100} />
          </NavbarBrand>
        </NavbarContent>

        <NavbarContent className='hidden sm:flex gap-4' justify='center'>
          <NavbarBrand>
            <Image src='/xnorik-logo.png' width={100} />
          </NavbarBrand>

          <NavbarItem>
            <Link color='foreground' href='/'>
              Inicio
            </Link>
          </NavbarItem>
          <NavbarItem isActive>
            <Link aria-current='page' href='/'>
              Contacto
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link color='foreground' href='/'>
              Servicios
            </Link>
          </NavbarItem>
        </NavbarContent>

        <NavbarContent justify='end' className='hidden sm:flex'>
          <NavbarItem>
            <Button radius='none' color='secondary' variant='shadow' size='md' className='px-10 font-po'>
              Iniciar Sesion
            </Button>
          </NavbarItem>
        </NavbarContent>

        <NavbarMenu>
          
        </NavbarMenu>
      </Navbar>
    </Fragment>
  );
}