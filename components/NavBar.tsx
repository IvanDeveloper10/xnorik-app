'use client'

import { Fragment, useState, useEffect } from 'react'
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, NavbarMenuToggle, NavbarMenu, NavbarMenuItem } from '@heroui/navbar'
import { Button } from '@heroui/button'
import { Image } from '@heroui/image'
import Link from 'next/link'
import { getAuth, onAuthStateChanged, User, signOut } from 'firebase/auth'
import { Popover, PopoverTrigger, PopoverContent } from '@heroui/popover'
import { app } from '@/utils/firebase'
import { addToast } from '@heroui/toast'
import { Avatar } from '@heroui/avatar'
import { useRouter, usePathname } from 'next/navigation';

export default function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [photoURL, setPhotoURL] = useState('')
  const auth = getAuth(app)

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
    })
    return () => unsubscribe()
  }, [auth])

  const HandleSignOut = () => {
    signOut(auth)
      .then(() => {
        addToast({
          title: 'Se Ha Cerrado Sesión Correctamente',
          color: 'secondary',
          variant: 'bordered',
          radius: 'sm',
          hideIcon: true,
          timeout: 4000
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

  useEffect(() => {
    if (user) {
      const photoURL = user.photoURL ?? ''
      setPhotoURL(photoURL)
    }
  }, [user])

  const changeLanguage = (lng: string) => {
    router.push(`/${lng}${pathname}`);
  }

  return (
    <Fragment>
      <Navbar isBlurred shouldHideOnScroll isMenuOpen={isMenuOpen} onMenuOpenChange={setIsMenuOpen} className='w-full flex px-10 bg-slate-50 text-po'>
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
            <Link href='/' className='flex justify-center items-center gap-1'>
              <i className='fi fi-rr-home'></i>Inicio
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link href='/About' className='flex justify-center items-center gap-1'>
              <i className='fi fi-rr-info'></i>Acerca
            </Link>
          </NavbarItem>
          {user && (
            <NavbarItem>
              <Link href={'/HomeTech'} className='flex justify-center items-center gap-1'>
                <i className='fi fi-rr-browser'></i>Dashboard
              </Link>
            </NavbarItem>
          )}
        </NavbarContent>

        <NavbarContent justify='end' className='flex items-center gap-4'>
          {!user && (
            <>
              <NavbarItem>
                <Link href={'/Register'}>
                  <Button color='primary' variant='ghost' radius='lg'>
                    Registrarse
                  </Button>
                </Link>
              </NavbarItem>
              <NavbarItem>
                <Link href={'/Login'}>
                  <Button color='primary' variant='solid' radius='lg'>
                    Iniciar Sesión
                  </Button>
                </Link>
              </NavbarItem>
            </>
          )}

          {user && (
            <Popover backdrop='blur'>
              <PopoverTrigger>
                <Avatar src={photoURL} />
              </PopoverTrigger>
              <PopoverContent className='p-4'>
                <Button color='danger' variant='shadow' onPress={HandleSignOut}>
                  Cerrar Sesión
                </Button>
              </PopoverContent>
            </Popover>
          )}
        </NavbarContent>
      </Navbar>
    </Fragment>
  )
}
