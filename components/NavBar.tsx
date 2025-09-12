'use client'

import { Fragment, useState, useEffect } from 'react';
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, NavbarMenuToggle, NavbarMenu, NavbarMenuItem } from '@heroui/navbar';
import { Button } from '@heroui/button';
import { Image } from '@heroui/image';
import Link from 'next/link';
import { getAuth, onAuthStateChanged, User, signOut } from 'firebase/auth';
import { Popover, PopoverTrigger, PopoverContent } from '@heroui/popover';
import { app } from '@/utils/firebase';
import { addToast } from '@heroui/toast';
import { Avatar } from '@heroui/avatar';



export default function NavBar() {

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [photoURL, setPhotoURL] = useState('');
  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, [auth]);

  const HandleSignOut = () => {
    signOut(auth).then(() => {
      addToast({
        title: 'Se Ha Cerrado Sesión Correctamente',
        color: 'secondary',
        variant: 'bordered',
        radius: 'sm',
        hideIcon: true,
        timeout: 4000
      })
    }).catch((error) => {
      addToast({
        title: 'Ha Ocurrido Un Error Al Tratar De Cerrar Sesion',
        color: 'danger',
        variant: 'bordered',
        radius: 'sm',
        hideIcon: true, 
        timeout: 4000
      })
    })
  }

  useEffect(() => {
    if (user) {
      const photoURL = user.photoURL ?? '';
      setPhotoURL(photoURL);
    }
  }, []);

  return (
    <Fragment>
      <Navbar isBlurred={true} shouldHideOnScroll isMenuOpen={isMenuOpen} onMenuOpenChange={setIsMenuOpen} className='w-full flex px-10 bg-slate-50 text-po'>
        <NavbarContent className='hidden max-[746]:flex' justify='start'>
          <NavbarMenuToggle aria-label={isMenuOpen ? 'Close menu' : 'Open menu'} />
        </NavbarContent>

        <NavbarContent className='hidden max-[746]:flex'>
          <NavbarBrand>
            <Image src='/xnorik-logo.png' width={100} />
          </NavbarBrand>
        </NavbarContent>

        <NavbarContent className='hidden min-[746]:flex' justify='center'>
          <NavbarBrand>
            <Image src='/xnorik-logo.png' width={100} />
          </NavbarBrand>
          <NavbarItem>
            <Link href='/' className='flex justify-center items-center gap-1'><i className='fi fi-rr-home flex justify-center items-center'></i>Inicio</Link>
          </NavbarItem>
          <NavbarItem>
            <Link href='/About' className='flex justify-center items-center gap-1'><i className='fi fi-rr-info flex justify-center items-center'></i>Acerca</Link>
          </NavbarItem>
          {user && (
            <NavbarItem>
              <Link href={'/HomeTech'} className='flex justify-center items-center gap-1'><i className='fi fi-rr-browser flex justify-center items-center'></i> Dashboard</Link>
            </NavbarItem>
          )}
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

        {user && (
          <Popover backdrop='blur'>
            <PopoverTrigger>
              <Avatar src={photoURL} />
            </PopoverTrigger>
            <PopoverContent className='p-4'>
              <Button className='' color='danger' variant='shadow' onPress={HandleSignOut}>Cerrar Sesion</Button>
            </PopoverContent>
          </Popover>
        )}
      
        <NavbarMenu className='text-po gap-2'>
          <NavbarMenuItem>
              <Link href='/' className='flex justify-start items-center gap-1'><i className='fi fi-rr-home flex justify-center items-center'></i>Inicio</Link>
          </NavbarMenuItem>
          <NavbarMenuItem>
              <Link href='/About' className='flex justify-start items-center gap-1'><i className='fi fi-rr-info flex justify-center items-center'></i>Acerca</Link>
          </NavbarMenuItem>
          <NavbarMenuItem>
            {user && (
                <Link href={'/HomeUser'} className='flex justify-start items-center gap-1'><i className='fi fi-rr-browser flex justify-center items-center'></i> Dashboard</Link>
            )}
          </NavbarMenuItem>
        </NavbarMenu>
      </Navbar>
    </Fragment>
  );
}