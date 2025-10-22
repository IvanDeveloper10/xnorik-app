'use client';

import { Fragment, useState, useEffect } from 'react';
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, NavbarMenuToggle } from '@heroui/navbar';
import { Button } from '@heroui/button';
import { Image } from '@heroui/image';
import Link from 'next/link';
import { getAuth, onAuthStateChanged, User, signOut } from 'firebase/auth';
import { Popover, PopoverTrigger, PopoverContent } from '@heroui/popover';
import { app } from '@/utils/firebase';
import { addToast } from '@heroui/toast';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/dropdown';
import { Spinner } from '@heroui/spinner';
import { useRouter, usePathname } from 'next/navigation';


export default function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [loadingUser, setLoadingUser] = useState(true) 
  const auth = getAuth(app)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoadingUser(false) 
    })
    return () => unsubscribe()
  }, [auth])

  const HandleSignOut = () => {
    router.push('/');
    signOut(auth)
      .then(() => {
        addToast({
          title: 'Se Ha Cerrado Sesión Correctamente',
          color: 'secondary',
          variant: 'bordered',
          radius: 'sm',
          hideIcon: true,
          timeout: 4000,
        })
      })
      .catch(() => {
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

  return (
    <Fragment>
      <Navbar
        isBlurred
        shouldHideOnScroll
        isMenuOpen={isMenuOpen}
        onMenuOpenChange={setIsMenuOpen}
        className='w-full flex justify-around items-center px-10 bg-slate-50 text-po'
      >
        <NavbarContent className='hidden max-[746]:flex'>
          <NavbarMenuToggle aria-label={isMenuOpen ? 'Close menu' : 'Open menu'} />
        </NavbarContent>

        <NavbarBrand className='text-po gap-2'>
          <Image src={'/image-xnorik-logo.jpg'} alt={'Image Xnorik Logo'} width={40} height={40} /> XNORIK
        </NavbarBrand>

        <NavbarContent className='flex justify-center items-center' justify='center'>
          <NavbarItem>
            <Link href='/' className='flex justify-center items-center gap-1'>
              <i className='fi fi-rr-home flex justify-center items-center'></i>Inicio
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link href='/About' className='flex justify-center items-center gap-1'>
              <i className='fi fi-rr-info flex justify-center items-center'></i>Acerca
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link href='/UsPage' className='flex justify-center items-center gap-1'>
              <i className='fi fi-rr-users flex justify-center items-center'></i>Nosotros
            </Link>
          </NavbarItem>
          <NavbarItem className='flex justify-end items-end'>
            <Dropdown className='text-po'>
              <DropdownTrigger className='hover:cursor-pointer'>
                <span className='flex justify-center items-center gap-1'>
                  Soluciones <i className='fi fi-rr-angle-down flex justify-center items-center'></i>
                </span>
              </DropdownTrigger>
              <DropdownMenu aria-label='Soluciones'>
                <DropdownItem key={'Correo Electronico'}>
                  <Link href={'mailto:xnorik.email@gmail.com'}>
                    <span className='flex justify-start items-center gap-3'>
                      <i className='fi fi-rr-envelope flex justify-center items-center'></i> Correo Electronico
                    </span>
                  </Link>
                </DropdownItem>
                <DropdownItem key={'Whattsap'}>
                  <Link href={'https://wa.me/573330509919'}>
                    <span className='flex justify-start items-center gap-3'>
                      <i className='fi fi-rr-circle-phone-flip flex justify-center items-center'></i> Whattsap
                    </span>
                  </Link>
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </NavbarItem>

          {loadingUser ? (
            <NavbarItem>
              <Spinner color='secondary' size='sm' />
            </NavbarItem>
          ) : user ? (
            <NavbarItem>
              <Link href={'/User'} className='flex justify-center items-center gap-1'>
                <i className='fi fi-rr-browser flex justify-center items-center'></i>Tecnico
              </Link>
            </NavbarItem>
          ) : (
            <NavbarContent justify='end'>
              <Popover className='w-60 text-po flex' color='secondary'>
                <PopoverTrigger>
                  <Button
                    radius='full'
                    className='flex justify-center items-center'
                    variant='bordered'
                    color='secondary'
                  >
                    Ingresar <i className='fi fi-rr-angle-down flex justify-center items-center'></i>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='flex justify-start items-start p-4 gap-4'>
                  <Link href={'/Register'} className='flex justify-center items-center gap-2'>
                    <i className='fi fi-rr-user flex justify-center items-center'></i> Registrarse
                  </Link> 
                  <Link href={'/Login'} className='flex justify-center items-center gap-2'>
                    <i className='fi fi-rr-users flex justify-center items-center'></i> Iniciar Sesion
                  </Link>
                </PopoverContent>
              </Popover>
            </NavbarContent>
          )}
        </NavbarContent>
        {user && (
          <NavbarContent justify='end'>
            <Button variant='shadow' color='danger' onPress={HandleSignOut}>Cerrar Sesion</Button>
          </NavbarContent>
        )}
      </Navbar>
    </Fragment>
  )
}
