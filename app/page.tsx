'use client'

import { Fragment, useState } from 'react';
import { Input } from '@heroui/input';
import { Button } from '@heroui/button';
import Image from 'next/image';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/modal';
import { Card, CardHeader, CardBody } from '@heroui/card';
import { Progress } from '@heroui/progress';
import { Spinner } from '@heroui/spinner';
import { addToast } from '@heroui/toast';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { Divider } from '@heroui/divider';
import { app } from '@/utils/firebase';

const db = getFirestore(app);

interface ServiceData {
  id?: string;
  trackingCode: string;
  nombreCliente: string;
  direccionCliente: string;
  cedulaCliente: string;
  celularCliente: string;
  emailCliente: string;
  direccionTecnico: string;
  cedulaTecnico: string;
  celularTecnico: string;
  emailTecnico: string;
  sistemaOperativo: string;
  marcaComputadora: string;
  tipoComputadora: string;
  estadoTeclado: string;
  estadoPantalla: string;
  estadoMouse: string;
  estadoDVD: string;
  estadoCarcasa: string;
  funcionaCorrectamente: string;
  imageUrls?: string[];
  nombreTecnico: string;
  tipoMantenimiento: string;
  observaciones: string;
  currentStatus?: string;
  createdAt?: any;
  maintenanceStates?: any[];
}

const MAINTENANCE_STATUSES = [
  { key: 'pending', label: 'Pendiente',description: 'Servicio creado, esperando iniciar', progress: 0 },
  { key: 'diagnosis', label: 'Diagnóstico', description: 'Analizando problemas y necesidades', progress: 20},
  { key: 'cleaning', label: 'Limpieza', description: 'Limpieza interna y externa del equipo', progress: 40 },
  { key: 'repair', label: 'Reparación', description: 'Realizando reparaciones necesarias', progress: 60 },
  { key: 'testing', label: 'Pruebas', description: 'Probando el funcionamiento del equipo', progress: 80 },
  { key: 'completed', label: 'Completado', description: 'Mantenimiento finalizado con exito', progress: 100 }
];



export default function HomePage(): JSX.Element {

  const [searchCode, setSearchCode] = useState('');
  const [searchedService, setSearchedService] = useState<ServiceData | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleSearchService = async () => {
    if (!searchCode.trim()) return;

    setSearchLoading(true);
    try {
      const q = query(
        collection(db, 'servicios'),
        where('trackingCode', '==', searchCode.toUpperCase())
      );
      const querySnapShot = await getDocs(q);

      if (querySnapShot.empty) {
        addToast({
          title: 'No se encontró el servicio',
          description: 'Verifica el codigo e intenta nuevamente',
          variant: 'bordered',
          color: 'warning'
        });
        setSearchedService(null);
        setIsModalOpen(false);
      } else {
        const serviceData = {
          id: querySnapShot.docs[0].id,
          ...querySnapShot.docs[0].data()
        } as ServiceData;
        setSearchedService(serviceData);
        setIsModalOpen(true);
        addToast({
          title: 'Servicio encontrado',
          variant:'bordered',
          color: 'success'
        });
      }
    } catch (error) {
      console.error('Error buscando el servicio:', error);
      addToast({
        title: 'Error al buscar servicio',
        variant: 'bordered',
        color: 'danger'
      });
    } finally {
      setSearchLoading(false);
    }
  };

  const formatTimestamp = (value: any) => {
    if (!value) return '';
    if (value.toDate && typeof value.toDate === 'function') {
      try {
        return value.toDate().toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch (e) {
        return String(value);
      }
    }
    try {
      return new Date(value).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return String(value);
    }
  };

  const getCurrentProgress = (service: ServiceData): number => {
    if (!service.currentStatus) return 0;
    const statusInfo = MAINTENANCE_STATUSES.find((s) => s.key === service.currentStatus);
    return statusInfo ? statusInfo.progress: 0;
  }

  const getStatusDescription = (status: string | undefined): string => {
    const statusInfo = MAINTENANCE_STATUSES.find(s => s.key === status);
    return statusInfo ? statusInfo.description : 'Estado no disponible';
  }

  return (
    <Fragment>
      <section className='h-screen rounded-xl w-full flex justify-center p-10 max-md:p-5'>
        <main className='mt-10 max-md:mt-0 flex flex-col justify-center max-md:justify-start max-md:items-center gap-10 text-po w-2/4 max-md:w-full'>
          <h1 className='font-extrabold text-4xl text-po max-md:text-center max-md:text-5xl max-sm:text-xl'>SIGA EL ESTADO DE SU <i className='bg-blue-500 px-5 rounded-xl text-white max-md:hidden'>COMPUTADORA</i></h1>
          <h1 className='min-md:hidden bg-purple-500 font-extrabold px-5 rounded-xl text-white text-6xl max-sm:text-2xl'>COMPUTADORA</h1>
          <div className='min-md:hidden'>
            <Image src={'/image-track.svg'} alt={'Image Track'} width={400} height={400}></Image>
          </div>
          <label className='flex max-md:w-full'>
            <Input label={'Ingrese El Ticket'} color='primary' radius='none' className='rounded-l-xl w-96 max-md:w-full max-sm:h-11' value={searchCode} onChange={(e) => setSearchCode(e.target.value.toUpperCase())} />
            <Button color='primary' onPress={handleSearchService} isLoading={searchLoading} radius='none' className='h-full flex justify-center items-center gap-1 rounded-r-xl max-sm:h-11'><i className='fi fi-rr-search flex justify-center items-ceter'></i>{searchLoading ? <Spinner size='sm' /> : 'Buscar'}</Button>
          </label>
        </main>
        <div className='max-md:hidden flex justify-center items-center'>
          <Image src={'/image-track.svg'} alt={'Image Track'} width={400} height={400}></Image>
        </div>
        {searchedService && (
          <Modal
            isOpen={isModalOpen}
            onOpenChange={setIsModalOpen}
            size="5xl"
            scrollBehavior="inside"
          >
            <ModalContent>
              <ModalHeader className='flex flex-col gap-1'>
                <h2 className='text-4xl text-center font-bold text-black text-po'>
                  ESTADO DEL SERVICIO - {searchedService?.trackingCode}
                </h2>
                <p className='text-sm text-po text-gray-500'>
                  Fecha de creación: {searchedService?.createdAt ? formatTimestamp(searchedService.createdAt) : 'No disponible'}
                </p>
              </ModalHeader>
              <ModalBody>
                {searchedService && (
                  <div className='space-y-6'>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                      <Card className='shadow-md'>
                        <CardHeader className='bg-blue-50'>
                          <h3 className='font-semibold text-center text-po'>Información del Cliente</h3>
                        </CardHeader>
                        <CardBody className='space-y-2'>
                          <p className='text-po'><span className='font-medium'>Nombre:</span> {searchedService.nombreCliente}</p>
                          <p className='text-po'><span className='font-medium'>Dirección:</span> {searchedService.direccionCliente}</p>
                          <p className='text-po'><span className='font-medium'>Cédula:</span> {searchedService.cedulaCliente}</p>
                          <p className='text-po'><span className='font-medium'>Número Celular:</span> {searchedService.celularCliente}</p>
                          <p className='text-po'><span className='font-medium'>Email:</span> {searchedService.emailCliente}</p>
                        </CardBody>
                      </Card>

                      <Card className='shadow-md'>
                        <CardHeader className='bg-purple-50'>
                          <h3 className='font-semibold text-center text-po'>Información del Técnico</h3>
                        </CardHeader>
                        <CardBody className='space-y-2'>
                          <p className='text-po'><span className='font-medium'>Nombre:</span> {searchedService.nombreTecnico}</p>
                          <p className='text-po'><span className='font-medium'>Dirección:</span> {searchedService.direccionTecnico}</p>
                          <p className='text-po'><span className='font-medium'>Cédula:</span> {searchedService.cedulaTecnico}</p>
                          <p className='text-po'><span className='font-medium'>Número Celular:</span> {searchedService.celularTecnico}</p>
                          <p className='text-po'><span className='font-medium'>Email:</span> {searchedService.emailTecnico}</p>
                        </CardBody>
                      </Card>
                    </div>

                    <Divider />


                    <Card className='shadow-md'>
                      <CardHeader className='bg-purple-50 text-po'>
                        <h3 className='font-semibold'>Información de la Computadora</h3>
                      </CardHeader>
                      <CardBody className='text-po'>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                          <div className='space-y-2'>
                            <p><span className='font-medium'>Sistema Operativo:</span> {searchedService.sistemaOperativo}</p>
                            <p><span className='font-medium'>Marca:</span> {searchedService.marcaComputadora}</p>
                            <p><span className='font-medium'>Tipo:</span> {searchedService.tipoComputadora}</p>
                            <p><span className='font-medium'>Mantenimiento:</span> {searchedService.tipoMantenimiento}</p>
                          </div>
                          <div className='space-y-2'>
                            <p><span className='font-medium'>Teclado:</span> {searchedService.estadoTeclado}</p>
                            <p><span className='font-medium'>Pantalla:</span> {searchedService.estadoPantalla}</p>
                            <p><span className='font-medium'>Mouse:</span> {searchedService.estadoMouse}</p>
                            <p><span className='font-medium'>Funcionamiento:</span> {searchedService.funcionaCorrectamente}</p>
                          </div>
                        </div>
                      </CardBody>
                    </Card>

                    <Divider />
                    <div className='space-y-4 text-po'>
                      <h3 className='font-semibold text-lg text-po text-center'>PROGRESO DEL MANTENIMIENTO</h3>
                      <Progress
                        value={getCurrentProgress(searchedService)}
                        className='w-full'
                        size='lg'
                        color='primary'
                      />
                      <div className='flex justify-between text-sm text-gray-600'>
                        <span>0%</span>
                        <span className='font-medium'>
                          {MAINTENANCE_STATUSES.find(s => s.key === searchedService.currentStatus)?.label || 'Pendiente'}
                        </span>
                        <span>100%</span>
                      </div>

                      <Card className='bg-blue-50 border-blue-200'>
                        <CardBody>
                          <p className='text-blue-800 font-medium'>
                            {getStatusDescription(searchedService.currentStatus)}
                          </p>
                        </CardBody>
                      </Card>
                    </div>

                    <Divider />

                    {searchedService.observaciones && (
                      <Card className='shadow-md'>
                        <CardHeader className='bg-yellow-50'>
                          <h3 className='font-semibold text-po'>Observaciones</h3>
                        </CardHeader>
                        <CardBody>
                          <p className='text-gray-700'>{searchedService.observaciones}</p>
                        </CardBody>
                      </Card>
                    )}

                    {searchedService.maintenanceStates && searchedService.maintenanceStates.length > 0 && (
                      <>
                        <Divider />
                        <div className='space-y-4 text-po'>
                          <h3 className='font-semibold text-lg'>Historial de Estados</h3>
                          <div className='space-y-3'>
                            {searchedService.maintenanceStates.map((state, index) => (
                              <Card key={index} className='shadow-sm'>
                                <CardBody className='py-3'>
                                  <div className='flex justify-between items-center'>
                                    <div>
                                      <p className='font-medium'>
                                        {MAINTENANCE_STATUSES.find(s => s.key === state.status)?.label}
                                      </p>
                                      <p className='text-sm text-gray-500'>
                                        {state.notes && `Notas: ${state.notes}`}
                                      </p>
                                    </div>
                                    <p className='text-sm text-gray-500'>
                                      {formatTimestamp(state.updatedAt)}
                                    </p>
                                  </div>
                                </CardBody>
                              </Card>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </ModalBody>
              <ModalFooter className='text-po'>
                <Button color='primary' className='text-white' onPress={() => setIsModalOpen(false)}>
                  Cerrar
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        )}
      </section>
      <section className='w-full h-screen bg-black rounded-4xl flex justify-around items-center'>
        <div className='w-2/4 flex justify-center items-center flex-col gap-10 px-5 max-md:px-10 max-md:w-full max-md:justify-center max-md:items-center max-md:gap-0'>
          <h1 className='text-white text-po font-bold text-5xl text-center max-sm:text-2xl'>¿QUE ES XNORIK?</h1>
          <Image src={'/image-call.svg'} className='flex min-md:hidden' width={500} height={400} alt={'Image Call'} />
          <p className='w-full text-white text-po font-light max-sm:text-sm'>Xnorik, es un servicio web que prioriza la comunicación entre un técnico de reparación y su respectivo cliente, brindando confianza y seguridad.</p>
        </div>
        <div className='2/4 max-md:hidden'>
          <Image src={'/image-call.svg'} width={500} height={400} alt={'Image Call'}/>
        </div>
      </section>
      <section className='w-full h-screen flex justify-around items-center'>
        <div className='w-2/4 flex justify-center items-center max-md:hidden'>
          <Image src={'/image-function.svg'} alt={'Image Function'} width={500} height={500} />
        </div>
        <div className='w-2/4 flex justify-center items-center flex-col gap-10 px-5 max-md:px-10 max-md:w-full max-md:justify-center max-md:items-center max-md:gap-0'>
          <h1 className='text-po font-bold text-5xl text-center max-sm:text-2xl'>¿COMO FUNCIONA?</h1>
          <Image src={'/image-function.svg'} alt={'Image Function'} className='flex min-md:hidden' width={500} height={500} />
          <p className='w-full text-po font-light max-sm:text-sm'>El técnico, al registrar una cuenta e iniciar sesion, tiene una sección reservada para la creación de servicios de mantenimiento y reparación, cuando "Agrega Un Nuevo Servicio" debe responder datos y además se generará un codigo o ticket que debe ser enviado al cliente para que pueda ingresarlo, y así buscar el estado de su computadora.</p>
        </div>
      </section>
    </Fragment>
  );
}