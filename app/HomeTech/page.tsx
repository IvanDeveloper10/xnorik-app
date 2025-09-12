'use client';
import { Fragment, useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { app } from '@/utils/firebase';
import { Button } from '@heroui/button';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/modal';
import { Input, Textarea } from '@heroui/input';
import { RadioGroup, Radio } from '@heroui/radio';
import { Card, CardHeader, CardBody } from '@heroui/card';
import { Divider } from '@heroui/divider';
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
  where,
  deleteDoc,
  doc,
  updateDoc,
  arrayUnion,
  Timestamp
} from 'firebase/firestore';
import { addToast } from '@heroui/toast';
import { Image } from '@heroui/image';
import { Spinner } from '@heroui/spinner';
import { Progress } from '@heroui/progress';

const db = getFirestore(app);

type MaintenanceStatus =
  | 'pending'
  | 'diagnosis'
  | 'cleaning'
  | 'repair'
  | 'testing'
  | 'completed';

interface MaintenanceState {
  status: MaintenanceStatus;
  updatedAt: any;
  notes?: string;
}

interface ServiceData {
  id?: string;
  trackingCode: string;
  nombreCliente: string;
  direccionCliente: string;
  cedulaCliente: string;
  celularCliente: string;
  emailCliente: string;
  nombreTecnico: string;
  direccionTecnico: string;
  cedulaTecnico: string;
  celularTecnico: string;
  emailTecnico: string;
  sistemaOperativo: string;
  marcaComputadora: string;
  tipoComputadora: string;
  tipoMantenimiento: string;
  estadoTeclado: string;
  estadoPantalla: string;
  estadoMouse: string;
  estadoDVD: string;
  estadoCarcasa: string;
  funcionaCorrectamente: string;
  observaciones: string;
  userId: string;
  createdAt?: any;
  maintenanceStates?: MaintenanceState[];
  currentStatus?: MaintenanceStatus;
}

const MAINTENANCE_STATUSES: {
  key: MaintenanceStatus;
  label: string;
  description: string;
  progress: number;
}[] = [
    { key: 'pending', label: 'Pendiente', description: 'Servicio creado, esperando iniciar', progress: 0 },
    { key: 'diagnosis', label: 'Diagnóstico', description: 'Analizando problemas y necesidades', progress: 20 },
    { key: 'cleaning', label: 'Limpieza', description: 'Limpieza interna y externa del equipo', progress: 40 },
    { key: 'repair', label: 'Reparación', description: 'Realizando reparaciones necesarias', progress: 60 },
    { key: 'testing', label: 'Pruebas', description: 'Probando el funcionamiento del equipo', progress: 80 },
    { key: 'completed', label: 'Completado', description: 'Mantenimiento finalizado con éxito', progress: 100 }
  ];

export default function HomeTech(): JSX.Element | null {
  const [isOpen, setIsOpen] = useState(false);

  const [user, setUser] = useState<User | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [images, setImages] = useState<string[]>([]);
  const [services, setServices] = useState<ServiceData[]>([]);
  const [selectedService, setSelectedService] = useState<ServiceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [firestoreError, setFirestoreError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [statusNotes, setStatusNotes] = useState<string>('');

  const [formData, setFormData] = useState<ServiceData>({
    nombreCliente: '',
    trackingCode: '',
    direccionCliente: '',
    cedulaCliente: '',
    celularCliente: '',
    emailCliente: '',
    nombreTecnico: '',
    direccionTecnico: '',
    cedulaTecnico: '',
    celularTecnico: '',
    emailTecnico: '',
    sistemaOperativo: '',
    marcaComputadora: '',
    tipoComputadora: '',
    tipoMantenimiento: '',
    estadoTeclado: '',
    estadoPantalla: '',
    estadoMouse: '',
    estadoDVD: '',
    estadoCarcasa: '',
    funcionaCorrectamente: '',
    observaciones: '',
    userId: ''
  });

  const router = useRouter();
  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push('/Login');
      } else {
        setUser(currentUser);
        setFormData(prev => ({ ...prev, userId: currentUser.uid }));
      }
      setCheckingAuth(false);
    });
    return () => unsubscribe();
  }, [auth, router]);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'servicios'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const serviciosData = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data()
        })) as ServiceData[];
        serviciosData.sort((a, b) => {
          if (a.createdAt && b.createdAt && a.createdAt.toDate && b.createdAt.toDate) {
            return b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime();
          }
          return 0;
        });

        setServices(serviciosData);
        setFirestoreError(null);
      },
      (error) => {
        console.error('Error en Firestore:', error);
        setFirestoreError(error.message || 'Error desconocido');
        addToast({
          title: 'Error al cargar servicios',
          description: 'Por favor, verifica tu conexión o contacta al administrador',
          variant: 'bordered',
          color: 'danger'
        });
      }
    );

    return () => unsubscribe();
  }, [user]);
  useEffect(() => {
    return () => {
      images.forEach((url) => {
        try {
          URL.revokeObjectURL(url);
        } catch (e) {
        }
      });
    };
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      images.forEach((url) => {
        try {
          URL.revokeObjectURL(url);
        } catch (err) {
        }
      });

      const files = Array.from(e.target.files);
      const previews = files.map((file) => URL.createObjectURL(file));
      setImages(previews);
    }
  };

  const handleInputChange = (field: keyof ServiceData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const generateTrackingCode = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const trackingCode = generateTrackingCode();

      await addDoc(collection(db, 'servicios'), {
        ...formData,
        trackingCode,
        userId: user.uid,
        createdAt: serverTimestamp(),
        currentStatus: 'pending',
        maintenanceStates: [
          {
            status: 'pending',
            updatedAt: Timestamp.now(),
            notes: 'Servicio creado'
          }
        ]
      });

      addToast({
        title: `Código de seguimiento: ${trackingCode}`,
        variant: 'bordered',
        color: 'success',
        timeout: 4000,
      });
      setIsOpen(false);
      setFormData({
        trackingCode: '',
        nombreCliente: '',
        direccionCliente: '',
        cedulaCliente: '',
        celularCliente: '',
        emailCliente: '',
        nombreTecnico: '',
        direccionTecnico: '',
        cedulaTecnico: '',
        celularTecnico: '',
        emailTecnico: '',
        sistemaOperativo: '',
        marcaComputadora: '',
        tipoComputadora: '',
        tipoMantenimiento: '',
        estadoTeclado: '',
        estadoPantalla: '',
        estadoMouse: '',
        estadoDVD: '',
        estadoCarcasa: '',
        funcionaCorrectamente: '',
        observaciones: '',
        userId: user.uid
      });
      images.forEach((url) => {
        try {
          URL.revokeObjectURL(url);
        } catch (err) {
        }
      });
      setImages([]);
    } catch (error) {
      console.error('Error guardando datos: ', error);
      addToast({
        title: 'Hubo un error al guardar los datos',
        variant: 'bordered',
        color: 'danger'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este servicio?')) return;

    setDeletingId(serviceId);
    try {
      await deleteDoc(doc(db, 'servicios', serviceId));
      addToast({
        title: 'Servicio eliminado correctamente',
        variant: 'bordered',
        color: 'success'
      });
      setSelectedService(null);
    } catch (error) {
      console.error('Error eliminando servicio: ', error);
      addToast({
        title: 'Hubo un error al eliminar el servicio',
        variant: 'bordered',
        color: 'danger'
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleStartMaintenance = async (serviceId: string) => {
    if (!serviceId) return;

    setUpdatingStatus(serviceId);
    try {
      const newStatus: MaintenanceStatus = 'diagnosis';
      const newState: MaintenanceState = {
        status: newStatus,
        updatedAt: Timestamp.now(), 
        notes: 'Mantenimiento iniciado'
      };

      const serviceRef = doc(db, 'servicios', serviceId);

      await updateDoc(serviceRef, {
        currentStatus: newStatus,
        maintenanceStates: arrayUnion(newState)
      });

      addToast({
        title: 'Mantenimiento iniciado',
        description: 'El estado ha cambiado a Diagnóstico',
        variant: 'bordered',
        color: 'success'
      });
      setSelectedService((prev) =>
        prev && prev.id === serviceId
          ? {
            ...prev,
            currentStatus: newStatus,
            maintenanceStates: [...(prev.maintenanceStates || []), newState]
          }
          : prev
      );
    } catch (error) {
      console.error('Error iniciando mantenimiento: ', error);
      addToast({
        title: 'Error al iniciar mantenimiento',
        variant: 'bordered',
        color: 'danger'
      });
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleUpdateStatus = async (serviceId: string, newStatus: MaintenanceStatus) => {
    if (!serviceId) return;

    setUpdatingStatus(`${serviceId}-${newStatus}`);
    try {
      const newState: MaintenanceState = {
        status: newStatus,
        updatedAt: Timestamp.now(), 
        notes: statusNotes || `Cambiado a ${MAINTENANCE_STATUSES.find((s) => s.key === newStatus)?.label}`
      };

      await updateDoc(doc(db, 'servicios', serviceId), {
        currentStatus: newStatus,
        maintenanceStates: arrayUnion(newState)
      });

      addToast({
        title: 'Estado actualizado',
        description: `El estado ha cambiado a ${MAINTENANCE_STATUSES.find((s) => s.key === newStatus)?.label}`,
        variant: 'bordered',
        color: 'success'
      });

      setSelectedService((prev) =>
        prev && prev.id === serviceId
          ? {
            ...prev,
            currentStatus: newStatus,
            maintenanceStates: [...(prev.maintenanceStates || []), newState]
          }
          : prev
      );

      setStatusNotes('');
    } catch (error) {
      console.error('Error actualizando estado: ', error);
      addToast({
        title: 'Error al actualizar estado',
        variant: 'bordered',
        color: 'danger'
      });
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getCurrentProgress = (service: ServiceData | undefined): number => {
    if (!service || !service.currentStatus) return 0;
    const statusInfo = MAINTENANCE_STATUSES.find((s) => s.key === service.currentStatus);
    return statusInfo ? statusInfo.progress : 0;
  };

  const getNextStatus = (currentStatus: MaintenanceStatus): MaintenanceStatus | null => {
    const currentIndex = MAINTENANCE_STATUSES.findIndex((s) => s.key === currentStatus);
    return currentIndex < MAINTENANCE_STATUSES.length - 1
      ? MAINTENANCE_STATUSES[currentIndex + 1].key
      : null;
  };

  const formatTimestamp = (value: any) => {
    if (!value) return '';
    if (value.toDate && typeof value.toDate === 'function') {
      try {
        return value.toDate().toLocaleString();
      } catch (e) {
        return String(value);
      }
    }
    if (value instanceof Date) {
      return value.toLocaleString();
    }
    try {
      return new Date(value).toLocaleString();
    } catch (e) {
      return String(value);
    }
  };

  if (checkingAuth || !user) {
    return (
      <div className='flex justify-center items-center h-screen'>
        <Spinner size='lg' />
      </div>
    );
  }

  const canSave =
    Object.entries(formData)
      .filter(([key]) => key !== 'trackingCode') 
      .every(([_, val]) => val.toString().trim() !== '') &&
    images.length >= 4;

  

  return (
    <Fragment>
      <section className='container mx-auto p-4'>
        <main>
          <h1 className='text-5xl text-center my-10 font-extrabold text-po'>BIENVENIDO AL CENTRO DE CONTROL</h1>
        </main>
        <Divider />

        {firestoreError && (
          <div className='bg-danger-100 border border-danger-400 text-danger-700 px-4 py-3 rounded relative mb-4'>
            <strong className='font-bold'>Error de Firebase: </strong>
            <span className='block sm:inline'>{firestoreError}</span>
            <br />
          </div>
        )}

        <div className='my-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
          <Button
            className='flex flex-col justify-center items-center w-full h-48 text-po'
            color='secondary'
            variant='bordered'
            onPress={() => setIsOpen(true)}
          >
            Agregar Servicio
            <i className='fi fi-rr-plus text-5xl flex justify-center items-center' />
          </Button>

          {services.map((service) => (
            <div key={service.id} className='relative'>
              <Card
                className='w-full h-48 flex flex-col justify-between cursor-pointer'
                isPressable
                onPress={() => setSelectedService(service)}
              >
                <CardHeader className='pb-0'>
                  <h3 className='font-bold text-po text-lg text-left'>
                    Cliente:<br />
                    {service.nombreCliente}
                  </h3>
                </CardHeader>
                <CardBody className='text-sm text-po text-center pt-2'>
                  <p className='text-left'>Tipo: {service.tipoMantenimiento}</p>
                  <div className='mt-2'>
                    <Progress size='sm' value={getCurrentProgress(service)} className='max-w-md' />
                    <p className='text-xs text-gray-500 mt-1'>
                      {service.currentStatus
                        ? MAINTENANCE_STATUSES.find((s) => s.key === service.currentStatus)?.label
                        : 'Pendiente'}
                    </p>
                  </div>
                  <p className='text-xs text-gray-500 mt-2'>
                    {service.createdAt && service.createdAt.toDate
                      ? service.createdAt.toDate().toLocaleDateString()
                      : service.createdAt
                        ? formatTimestamp(service.createdAt)
                        : ''}
                  </p>
                </CardBody>
              </Card>

              <Button
                size='sm'
                color='danger'
                variant='flat'
                className='absolute top-2 right-2 z-10'
                onPress={() => handleDeleteService(service.id!)}
                isLoading={deletingId === service.id}
                isIconOnly
              >
                <i className='fi fi-rr-trash text-xs' />
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* Modal para agregar servicio */}
      <Modal isOpen={isOpen} onOpenChange={(open: boolean) => setIsOpen(open)} size='full' scrollBehavior='inside'>
        <ModalContent>
          <ModalHeader className='flex justify-center items-center'>
            <h1 className='text-center text-4xl font-extrabold text-po'>INFORMACIÓN DEL MANTENIMIENTO</h1>
          </ModalHeader>
          <ModalBody>
            <section className='w-full flex flex-col md:flex-row justify-between text-po gap-4'>
              <div className='w-full md:w-1/2 px-2 md:px-4 space-y-4'>
                <h2 className='text-po text-center font-bold'>Información Personal Del Cliente</h2>
                <Input
                  label='Nombres Y Apellidos Del Cliente'
                  color='secondary'
                  variant='underlined'
                  type='text'
                  value={formData.nombreCliente}
                  onChange={(e) => handleInputChange('nombreCliente', e.target.value)}
                />
                <Input
                  label='Dirección De Residencia'
                  color='secondary'
                  variant='underlined'
                  type='text'
                  value={formData.direccionCliente}
                  onChange={(e) => handleInputChange('direccionCliente', e.target.value)}
                />
                <Input
                  label='Número De Cedula'
                  color='secondary'
                  variant='underlined'
                  value={formData.cedulaCliente}
                  onChange={(e) => handleInputChange('cedulaCliente', e.target.value)}
                />
                <Input
                  label='Número De Celular'
                  color='secondary'
                  variant='underlined'
                  value={formData.celularCliente}
                  onChange={(e) => handleInputChange('celularCliente', e.target.value)}
                />
                <Input
                  label='Email O Correo Electronico'
                  color='secondary'
                  variant='underlined'
                  type='email'
                  value={formData.emailCliente}
                  onChange={(e) => handleInputChange('emailCliente', e.target.value)}
                />
              </div>
              <div className='w-full md:w-1/2 px-2 md:px-4 space-y-4'>
                <h2 className='text-center font-bold'>Información Personal Del Técnico</h2>
                <Input
                  label='Nombres Y Apellidos Del Técnico'
                  color='secondary'
                  variant='underlined'
                  value={formData.nombreTecnico}
                  onChange={(e) => handleInputChange('nombreTecnico', e.target.value)}
                />
                <Input
                  label='Dirección De Residencia'
                  color='secondary'
                  variant='underlined'
                  type='text'
                  value={formData.direccionTecnico}
                  onChange={(e) => handleInputChange('direccionTecnico', e.target.value)}
                />
                <Input
                  label='Número De Cedula'
                  color='secondary'
                  variant='underlined'
                  value={formData.cedulaTecnico}
                  onChange={(e) => handleInputChange('cedulaTecnico', e.target.value)}
                />
                <Input
                  label='Número De Celular'
                  color='secondary'
                  variant='underlined'
                  value={formData.celularTecnico}
                  onChange={(e) => handleInputChange('celularTecnico', e.target.value)}
                />
                <Input
                  label='Email O Correo Electronico'
                  color='secondary'
                  variant='underlined'
                  type='email'
                  value={formData.emailTecnico}
                  onChange={(e) => handleInputChange('emailTecnico', e.target.value)}
                />
              </div>
            </section>

            <div className='my-5'>
              <h1 className='text-center font-bold text-po'>Información De La Computadora</h1>
            </div>

            <div className='w-full grid grid-cols-1 md:grid-cols-2 gap-4'>
              <Card className='w-full p-4'>
                <CardHeader>
                  <h2 className='text-po'>Tipo De Computadora:</h2>
                </CardHeader>
                <CardBody>
                  <RadioGroup
                    className='text-po'
                    value={formData.tipoComputadora}
                    onValueChange={(val) => handleInputChange('tipoComputadora', val)}
                  >
                    <Radio value='Computadora De Escritorio'>Computadora De Escritorio</Radio>
                    <Radio value='Computadora Portátil'>Computadora Portatil</Radio>
                    <Radio value='Computadora Todo En Uno'>Computadora Todo En Uno</Radio>
                  </RadioGroup>
                </CardBody>
              </Card>

              <Card className='w-full p-4'>
                <CardHeader>
                  <h2 className='text-po'>¿Que Tipo De Mantenimiento?</h2>
                </CardHeader>
                <CardBody>
                  <RadioGroup
                    className='text-po'
                    value={formData.tipoMantenimiento}
                    onValueChange={(val) => handleInputChange('tipoMantenimiento', val)}
                  >
                    <Radio value='Preventivo'>Preventivo</Radio>
                    <Radio value='Correctivo'>Correctivo</Radio>
                    <Radio value='Predictivo'>Predictivo</Radio>
                  </RadioGroup>
                </CardBody>
              </Card>

              <Card className='w-full p-4'>
                <CardHeader>
                  <h2 className='text-po'>¿Teclado En Buen Estado?</h2>
                </CardHeader>
                <CardBody>
                  <RadioGroup
                    className='text-po'
                    value={formData.estadoTeclado}
                    onValueChange={(val) => handleInputChange('estadoTeclado', val)}
                  >
                    <Radio value='Si'>Si</Radio>
                    <Radio value='No'>No</Radio>
                    <Radio value='No Tiene'>No tiene</Radio>
                  </RadioGroup>
                </CardBody>
              </Card>

              <Card className='w-full p-4'>
                <CardHeader>
                  <h2 className='text-po'>¿Pantalla O Monitor En Buen Estado?</h2>
                </CardHeader>
                <CardBody>
                  <RadioGroup
                    className='text-po'
                    value={formData.estadoPantalla}
                    onValueChange={(val) => handleInputChange('estadoPantalla', val)}
                  >
                    <Radio value='Si'>Si</Radio>
                    <Radio value='No'>No</Radio>
                    <Radio value='No Tiene'>No tiene</Radio>
                  </RadioGroup>
                </CardBody>
              </Card>

              <Card className='w-full p-4'>
                <CardHeader>
                  <h2 className='text-po'>¿Mouse O Panel Táctil En Buen Estado?</h2>
                </CardHeader>
                <CardBody>
                  <RadioGroup
                    className='text-po'
                    value={formData.estadoMouse}
                    onValueChange={(val) => handleInputChange('estadoMouse', val)}
                  >
                    <Radio value='Si'>Si</Radio>
                    <Radio value='No'>No</Radio>
                    <Radio value='No Tiene'>No tiene</Radio>
                  </RadioGroup>
                </CardBody>
              </Card>

              <Card className='w-full p-4'>
                <CardHeader>
                  <h2 className='text-po'>¿Unidad DVD En Buen Estado?</h2>
                </CardHeader>
                <CardBody>
                  <RadioGroup
                    className='text-po'
                    value={formData.estadoDVD}
                    onValueChange={(val) => handleInputChange('estadoDVD', val)}
                  >
                    <Radio value='Si'>Si</Radio>
                    <Radio value='No'>No</Radio>
                    <Radio value='No Tiene'>No tiene</Radio>
                  </RadioGroup>
                </CardBody>
              </Card>

              <Card className='w-full p-4'>
                <CardHeader>
                  <h2 className='text-po'>¿Carcasa O Torre En Buen Estado?</h2>
                </CardHeader>
                <CardBody>
                  <RadioGroup
                    className='text-po'
                    value={formData.estadoCarcasa}
                    onValueChange={(val) => handleInputChange('estadoCarcasa', val)}
                  >
                    <Radio value='Si'>Si</Radio>
                    <Radio value='No'>No</Radio>
                    <Radio value='No Tiene'>No tiene</Radio>
                  </RadioGroup>
                </CardBody>
              </Card>

              <Card className='w-full p-4'>
                <CardHeader>
                  <h2 className='text-po'>¿Funciona Correctamente?</h2>
                </CardHeader>
                <CardBody>
                  <RadioGroup
                    className='text-po'
                    value={formData.funcionaCorrectamente}
                    onValueChange={(val) => handleInputChange('funcionaCorrectamente', val)}
                  >
                    <Radio value='Si'>Si</Radio>
                    <Radio value='No'>No</Radio>
                  </RadioGroup>
                </CardBody>
              </Card>

              <Input
                label='Sistema Operativo SO'
                className='text-po w-full'
                type='text'
                color='secondary'
                variant='underlined'
                value={formData.sistemaOperativo}
                onChange={(e) => handleInputChange('sistemaOperativo', e.target.value)}
              />

              <Input
                label='Marca De La Computadora'
                className='text-po w-full'
                type='text'
                color='secondary'
                variant='underlined'
                value={formData.marcaComputadora}
                onChange={(e) => handleInputChange('marcaComputadora', e.target.value)}
              />
            </div>

            <Divider className='my-10' />

            <div>
              <h2 className='text-center text-po font-bold my-10'>
                Cargue Almenos 4 Imagenes Del Estado Actual De La Computadora Desde Diferentes Vistas
              </h2>
            </div>

            <Input type='file' multiple accept='image/*' onChange={handleImageChange} className='w-full text-po' />

            {images.length > 0 && (
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mt-5'>
                {images.map((src, idx) => (
                  <Image key={idx} src={src} alt={`preview-${idx}`} className='w-full h-60 object-cover rounded-lg shadow-md' />
                ))}
              </div>
            )}

            <Divider className='my-10' />

            <div className='w-full flex flex-col gap-5'>
              <h2 className='text-center text-po font-bold'>Describa El Estado General De La Computadora Con Observaciones</h2>
              <Textarea
                label='Escriba La Descripción'
                variant='underlined'
                color='secondary'
                disableAutosize
                className='w-full text-po bg-purple-100 rounded-t-xl p-1'
                value={formData.observaciones}
                onChange={(e) => handleInputChange('observaciones', e.target.value)}
              />
            </div>
          </ModalBody>

          <ModalFooter className='text-white flex justify-center'>
            <Button
              isDisabled={!canSave}
              color='success'
              variant='shadow'
              radius='none'
              className='text-po w-full md:w-96 rounded-xl'
              onPress={handleSave}
              isLoading={loading}
            >
              Guardar Información
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal para ver/actualizar servicio seleccionado */}
      <Modal
        isOpen={!!selectedService}
        onOpenChange={(open: boolean) => {
          if (!open) setSelectedService(null);
        }}
        size='5xl'
        scrollBehavior='inside'
      >
        <ModalContent>
          <ModalHeader className='flex justify-center items-center'>
            <h1 className='text-center text-4xl font-extrabold text-po'>INFORMACIÓN DEL SERVICIO</h1>
          </ModalHeader>

          <ModalBody className='text-po'>
            {selectedService && (
              <div className='space-y-6'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <h2 className='font-bold text-center mb-4'>INFORMACIÓN DEL CLIENTE</h2>
                    <p>
                      <b className='font-bold'>Cliente:</b> {selectedService.nombreCliente}
                    </p>
                    <p>
                      <b className='font-bold'>Dirección:</b> {selectedService.direccionCliente}
                    </p>
                    <p>
                      <b className='font-bold'>Cédula:</b> {selectedService.cedulaCliente}
                    </p>
                    <p>
                      <b className='font-bold'>Celular:</b> {selectedService.celularCliente}
                    </p>
                    <p>
                      <b className='font-bold'>Email:</b> {selectedService.emailCliente}
                    </p>
                  </div>

                  <div>
                    <h2 className='font-bold text-center mb-4'>INFORMACIÓN DEL TÉCNICO</h2>
                    <p>
                      <b className='font-bold'>Técnico:</b> {selectedService.nombreTecnico}
                    </p>
                    <p>
                      <b className='font-bold'>Dirección:</b> {selectedService.direccionTecnico}
                    </p>
                    <p>
                      <b className='font-bold'>Cédula:</b> {selectedService.cedulaTecnico}
                    </p>
                    <p>
                      <b className='font-bold'>Celular:</b> {selectedService.celularTecnico}
                    </p>
                    <p>
                      <b className='font-bold'>Email:</b> {selectedService.emailTecnico}
                    </p>
                  </div>
                </div>

                <Divider />

                <h2 className='font-bold text-center'>ESTADO DE LA COMPUTADORA</h2>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <p>
                    <b className='font-bold'>Sistema Operativo:</b> {selectedService.sistemaOperativo}
                  </p>
                  <p>
                    <b className='font-bold'>Marca:</b> {selectedService.marcaComputadora}
                  </p>
                  <p>
                    <b className='font-bold'>Tipo De Computadora:</b> {selectedService.tipoComputadora}
                  </p>
                  <p>
                    <b className='font-bold'>Tipo De Mantenimiento:</b> {selectedService.tipoMantenimiento}
                  </p>
                  <p>
                    <b className='font-bold'>Teclado En Buen Estado:</b> {selectedService.estadoTeclado}
                  </p>
                  <p>
                    <b className='font-bold'>Pantalla En Buen Estado:</b> {selectedService.estadoPantalla}
                  </p>
                  <p>
                    <b className='font-bold'>Mouse O Touchpad En Buen Estado:</b> {selectedService.estadoMouse}
                  </p>
                  <p>
                    <b className='font-bold'>DVD En Buen Estado:</b> {selectedService.estadoDVD}
                  </p>
                  <p>
                    <b className='font-bold'>Carcasa En Buen Estado:</b> {selectedService.estadoCarcasa}
                  </p>
                  <p>
                    <b className='font-bold'>Funciona Correctamente:</b> {selectedService.funcionaCorrectamente}
                  </p>
                </div>

                <Divider />

                <div>
                  <h2 className='font-bold'>Observaciones:</h2>
                  <p className='bg-gray-100 p-4 rounded-lg'>{selectedService.observaciones}</p>
                </div>

                <Divider />

                <div>
                  <h2 className='font-bold text-center mb-4'>PROGRESO DEL MANTENIMIENTO</h2>

                  <Progress value={getCurrentProgress(selectedService)} className='max-w-full mb-6' />

                  <div className='space-y-4'>
                    {MAINTENANCE_STATUSES.map((statusInfo) => {
                      const state = selectedService.maintenanceStates?.find((s) => s.status === statusInfo.key);
                      const isCurrent = selectedService.currentStatus === statusInfo.key;
                      const isCompleted =
                        MAINTENANCE_STATUSES.findIndex((s) => s.key === selectedService.currentStatus) >=
                        MAINTENANCE_STATUSES.findIndex((s) => s.key === statusInfo.key);

                      return (
                        <Card
                          key={statusInfo.key}
                          className={`${isCurrent ? 'border-primary border-2' : ''} ${isCompleted ? 'bg-success-50' : 'bg-default-50'}`}
                        >
                          <CardBody>
                            <div className='flex justify-between items-center'>
                              <div>
                                <h3 className='font-bold'>{statusInfo.label}</h3>
                                <p className='text-sm text-gray-600'>{statusInfo.description}</p>
                                {state && (
                                  <p className='text-xs text-gray-500 mt-1'>
                                    Actualizado: {formatTimestamp(state.updatedAt)}
                                    {state.notes && ` - Notas: ${state.notes}`}
                                  </p>
                                )}
                              </div>
                              <div className='flex items-center'>
                                {isCompleted ? <i className='fi fi-rr-check text-success text-xl' /> : <div className='w-6 h-6 rounded-full border-2 border-gray-300' />}
                              </div>
                            </div>
                          </CardBody>
                        </Card>
                      );
                    })}
                  </div>

                  {selectedService.currentStatus !== 'completed' && (
                    <div className='mt-6 p-4 bg-default-100 rounded-lg'>
                      <h3 className='font-bold mb-3'>Actualizar estado de mantenimiento</h3>
                      <Textarea
                        label='Notas del estado actual'
                        placeholder='Describe lo que se ha realizado...'
                        value={statusNotes}
                        onChange={(e) => setStatusNotes(e.target.value)}
                        className='mb-3'
                      />
                      <div className='flex justify-end'>
                        <Button
                          color='primary'
                          onPress={() => {
                            const nextStatus = getNextStatus(selectedService.currentStatus as MaintenanceStatus);
                            if (nextStatus) {
                              handleUpdateStatus(selectedService.id!, nextStatus);
                            }
                          }}
                          isLoading={updatingStatus === `${selectedService.id}-${getNextStatus(selectedService.currentStatus as MaintenanceStatus)}`}
                        >
                          {selectedService.currentStatus === 'pending' ? 'Iniciar Mantenimiento' : 'Avanzar al Siguiente Estado'}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <Divider />

                <div>
                  <h2 className='font-bold text-center mb-4'>FECHA DE CREACIÓN</h2>
                  <p className='text-center'>{formatTimestamp(selectedService.createdAt)}</p>
                </div>
              </div>
            )}
          </ModalBody>

          <ModalFooter className='flex justify-between text-po'>
            <Button
              color='danger'
              variant='flat'
              onPress={() => selectedService && handleDeleteService(selectedService.id!)}
              isLoading={deletingId === selectedService?.id}
            >
              CANCELAR MANTENIMIENTO
            </Button>

            {selectedService?.currentStatus === 'pending' && (
              <Button
                className='text-po text-white'
                color='success'
                variant='shadow'
                onPress={() => selectedService && handleStartMaintenance(selectedService.id!)}
                isLoading={updatingStatus === selectedService?.id}
              >
                INICIAR MANTENIMIENTO
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Fragment>
  );
}