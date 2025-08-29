'use client';

import { Fragment, useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { app } from '@/utils/firebase';
import { Button } from '@heroui/button';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/modal';
import { useDisclosure } from '@heroui/modal';
import { Input, Textarea } from '@heroui/input';
import { RadioGroup, Radio } from '@heroui/radio';
import { Card, CardHeader, CardBody } from '@heroui/card';
import { Divider } from '@heroui/divider';
import { getFirestore, collection, addDoc, serverTimestamp, onSnapshot, query, orderBy } from 'firebase/firestore';

const db = getFirestore(app);

export default function HomeUser(): JSX.Element | null {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { isOpen: isDetailOpen, onOpen: onDetailOpen, onOpenChange: onDetailOpenChange } = useDisclosure();

  const [user, setUser] = useState<User | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [images, setImages] = useState<string[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    clienteNombre: '',
    clienteDireccion: '',
    clienteCedula: '',
    clienteCelular: '',
    clienteEmail: '',
    tecnicoNombre: '',
    tecnicoDireccion: '',
    tecnicoCedula: '',
    tecnicoCelular: '',
    tecnicoEmail: '',
    sistemaOperativo: '',
    marcaComputadora: '',
    tipoComputadora: '',
    teclado: '',
    pantalla: '',
    mouse: '',
    dvd: '',
    carcasa: '',
    observaciones: ''
  });

  const router = useRouter();
  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push('/Login');
      } else {
        setUser(currentUser);
      }
      setCheckingAuth(false);
    });

    return () => unsubscribe();
  }, [auth, router]);

  useEffect(() => {
    if (user) {
      const q = query(collection(db, 'servicios'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setServices(data);
      });
      return () => unsubscribe();
    }
  }, [user]);

  if (checkingAuth || !user) {
    return null;
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const previews = files.map((file) => URL.createObjectURL(file));
      setImages(previews);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      await addDoc(collection(db, 'servicios'), {
        ...formData,
        userId: user?.uid,
        createdAt: serverTimestamp(),
      });
      alert('✅ Datos guardados correctamente');
      onOpenChange();
      setFormData({
        clienteNombre: '',
        clienteDireccion: '',
        clienteCedula: '',
        clienteCelular: '',
        clienteEmail: '',
        tecnicoNombre: '',
        tecnicoDireccion: '',
        tecnicoCedula: '',
        tecnicoCelular: '',
        tecnicoEmail: '',
        sistemaOperativo: '',
        marcaComputadora: '',
        tipoComputadora: '',
        teclado: '',
        pantalla: '',
        mouse: '',
        dvd: '',
        carcasa: '',
        observaciones: ''
      });
      setImages([]);
    } catch (error) {
      console.error('Error guardando datos: ', error);
      alert('❌ Hubo un error guardando los datos');
    }
  };

  const canSave =
    Object.values(formData).every((val) => val.trim() !== '') && images.length >= 4;

  return (
    <Fragment>
      <section>
        <main>
          <h1 className='text-5xl text-center my-10 font-extrabold text-po'>
            BIENVENIDO AL CENTRO DE CONTROL
          </h1>
        </main>
        <Divider />
        <div className='my-10 px-10 flex gap-6 flex-wrap'>
          {/* Botón de agregar servicio */}
          <Button
            className='flex flex-col justify-center items-center w-48 h-48 text-po'
            color='secondary'
            variant='bordered'
            onPress={onOpen}
          >
            Agregar Servicio
            <i className='fi fi-rr-plus text-5xl flex justify-center items-center'></i>
          </Button>

          {/* Tarjetas de servicios guardados */}
          {services.map((service) => (
            <Card
              key={service.id}
              isPressable
              className='w-48 h-48 flex justify-center items-center text-center hover:shadow-lg transition'
              onPress={() => {
                setSelectedService(service);
                onDetailOpen();
              }}
            >
              <CardHeader>
                <h3 className='font-bold text-po'>CLIENTE:</h3>
              </CardHeader>
              <CardBody className='p-2'>
                <p className='text-sm text-gray-600 text-po'>{service.clienteNombre}</p>
                <p className='text-xs text-gray-400 text-po'>
                  {service.createdAt?.toDate().toLocaleDateString()}
                </p>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>

      {/* Modal para agregar servicio */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size='full' scrollBehavior='inside'>
        <ModalContent>
          <ModalHeader className='flex justify-center items-center'>
            <h1 className='text-center text-4xl font-extrabold text-po'>
              INFORMACIÓN DEL MANTENIMIENTO
            </h1>
          </ModalHeader>
          <ModalBody>
            {/* Formulario */}
            <section className='w-full flex justify-between text-po'>
              <div className='w-2/4 px-14'>
                <h2 className='text-po text-center font-bold'>Información Personal Del Cliente</h2>
                <Input label='Nombres Y Apellidos Del Cliente' color='secondary' variant='underlined' type='text'
                  onChange={(e) => handleInputChange('clienteNombre', e.target.value)} />
                <Input label='Dirección De Residencia' color='secondary' variant='underlined' type='text'
                  onChange={(e) => handleInputChange('clienteDireccion', e.target.value)} />
                <Input label='Número De Cedula' color='secondary' variant='underlined'
                  onChange={(e) => handleInputChange('clienteCedula', e.target.value)} />
                <Input label='Número De Celular' color='secondary' variant='underlined'
                  onChange={(e) => handleInputChange('clienteCelular', e.target.value)} />
                <Input label='Email O Correo Electronico' color='secondary' variant='underlined' type='email'
                  onChange={(e) => handleInputChange('clienteEmail', e.target.value)} />
              </div>
              <div className='w-2/4 px-14'>
                <h2 className='text-center font-bold'>Información Personal Del Técnico</h2>
                <Input label='Nombres Y Apellidos Del Técnico' color='secondary' variant='underlined'
                  onChange={(e) => handleInputChange('tecnicoNombre', e.target.value)} />
                <Input label='Dirección De Residencia' color='secondary' variant='underlined' type='text'
                  onChange={(e) => handleInputChange('tecnicoDireccion', e.target.value)} />
                <Input label='Número De Cedula' color='secondary' variant='underlined'
                  onChange={(e) => handleInputChange('tecnicoCedula', e.target.value)} />
                <Input label='Número De Celular' color='secondary' variant='underlined'
                  onChange={(e) => handleInputChange('tecnicoCelular', e.target.value)} />
                <Input label='Email O Correo Electronico' color='secondary' variant='underlined' type='email'
                  onChange={(e) => handleInputChange('tecnicoEmail', e.target.value)} />
              </div>
            </section>
            <Divider className='my-10' />
            <div className='w-full flex flex-col gap-5'>
              <h2 className='text-center text-po font-bold'>Observaciones</h2>
              <Textarea label='Escriba La Descripción' variant='underlined' color='secondary'
                onChange={(e) => handleInputChange('observaciones', e.target.value)} />
            </div>
          </ModalBody>
          <ModalFooter className='text-white'>
            <Button
              isDisabled={!canSave}
              color='success'
              variant='shadow'
              className='text-po w-96 rounded-xl'
              onPress={handleSave}
            >
              Guardar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal de detalles */}
      <Modal isOpen={isDetailOpen} onOpenChange={onDetailOpenChange} size="2xl">
        <ModalContent>
          <ModalHeader>
            <h2 className='text-xl font-bold text-po'>Detalles del Servicio</h2>
          </ModalHeader>
          <ModalBody>
            {selectedService && (
              <div className='space-y-3 text-sm'>
                <p><b>Cliente:</b> {selectedService.clienteNombre}</p>
                <p><b>Dirección:</b> {selectedService.clienteDireccion}</p>
                <p><b>Cédula:</b> {selectedService.clienteCedula}</p>
                <p><b>Celular:</b> {selectedService.clienteCelular}</p>
                <p><b>Email:</b> {selectedService.clienteEmail}</p>
                <Divider />
                <p><b>Técnico:</b> {selectedService.tecnicoNombre}</p>
                <p><b>Observaciones:</b> {selectedService.observaciones}</p>
              </div>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Fragment>
  );
}
