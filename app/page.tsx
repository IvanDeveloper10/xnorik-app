'use client'

import { Fragment, useState, useEffect } from 'react';
import { Input } from '@heroui/input';
import { Button } from '@heroui/button';
import Image from 'next/image';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/modal';
import { Card, CardHeader, CardBody } from '@heroui/card';
import { Progress } from '@heroui/progress';
import { Spinner } from '@heroui/spinner';
import { addToast } from '@heroui/toast';
import { getFirestore, collection, query, where, onSnapshot, doc } from 'firebase/firestore';
import { Divider } from '@heroui/divider';
import { app } from '@/utils/firebase';
import Footer from '@/components/Footer';

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

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const MAINTENANCE_STATUSES = [
  { key: 'pending', label: 'Pendiente', description: 'Servicio creado, esperando iniciar', progress: 0 },
  { key: 'diagnosis', label: 'Diagnóstico', description: 'Analizando problemas y necesidades', progress: 20 },
  { key: 'cleaning', label: 'Limpieza', description: 'Limpieza interna y externa del equipo', progress: 40 },
  { key: 'repair', label: 'Reparación', description: 'Realizando reparaciones necesarias', progress: 60 },
  { key: 'testing', label: 'Pruebas', description: 'Probando el funcionamiento del equipo', progress: 80 },
  { key: 'completed', label: 'Completado', description: 'Mantenimiento finalizado con éxito', progress: 100 }
];

// Conocimiento específico de Xnorik
const XNORIK_KNOWLEDGE = {
  about: "Xnorik es un servicio web que prioriza la comunicación entre técnicos de reparación y sus clientes, brindando confianza y seguridad en el proceso de mantenimiento y reparación de computadoras.",
  howItWorks: "Los técnicos registran servicios de mantenimiento generando un código único que comparten con los clientes. Los clientes pueden usar este código para seguir el progreso de su reparación en tiempo real.",
  services: "Ofrecemos seguimiento en tiempo real del mantenimiento, comunicación directa con técnicos, y transparencia en todo el proceso de reparación.",
  contact: "Puedes contactarnos a través de nuestro sitio web o comunicándote directamente con tu técnico asignado.",
  tracking: "Para rastrear tu equipo, ingresa el código de seguimiento proporcionado por tu técnico en la barra de búsqueda principal.",
  statuses: [
    "Pendiente: Servicio creado, esperando iniciar",
    "Diagnóstico: Analizando problemas y necesidades del equipo",
    "Limpieza: Realizando limpieza interna y externa",
    "Reparación: Solucionando problemas identificados",
    "Pruebas: Verificando el funcionamiento correcto",
    "Completado: Mantenimiento finalizado con éxito"
  ]
};

export default function HomePage(): JSX.Element {
  const [searchCode, setSearchCode] = useState('');
  const [searchedService, setSearchedService] = useState<ServiceData | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [unsubscribe, setUnsubscribe] = useState<(() => void) | null>(null);

  // Estados para el chatbot
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: '¡Hola! Soy el asistente virtual de Xnorik. ¿En qué puedo ayudarte hoy? Puedo responder preguntas sobre nuestros servicios, seguimiento de reparaciones, o cualquier duda que tengas.',
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [userMessage, setUserMessage] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Limpiar suscripción al desmontar el componente
  useEffect(() => {
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [unsubscribe]);

  const handleSearchService = async () => {
    if (!searchCode.trim()) return;

    setSearchLoading(true);
    try {
      const q = query(
        collection(db, 'servicios'),
        where('trackingCode', '==', searchCode.toUpperCase())
      );

      // Usar onSnapshot para suscripción en tiempo real
      const unsubscribeSnapshot = onSnapshot(
        q,
        (querySnapshot) => {
          if (querySnapshot.empty) {
            addToast({
              title: 'No se encontró el servicio',
              description: 'Verifica el código e intenta nuevamente',
              variant: 'bordered',
              color: 'warning'
            });
            setSearchedService(null);
            setIsModalOpen(false);
            if (unsubscribe) {
              unsubscribe();
              setUnsubscribe(null);
            }
          } else {
            const serviceData = {
              id: querySnapshot.docs[0].id,
              ...querySnapshot.docs[0].data()
            } as ServiceData;
            setSearchedService(serviceData);
            setIsModalOpen(true);
            addToast({
              title: 'Servicio encontrado',
              description: 'Los datos se actualizarán en tiempo real',
              variant: 'bordered',
              color: 'success'
            });

            // Suscribirse a cambios específicos de este documento para actualizaciones en tiempo real
            const serviceDocRef = doc(db, 'servicios', querySnapshot.docs[0].id);
            const serviceUnsubscribe = onSnapshot(serviceDocRef, (doc) => {
              if (doc.exists()) {
                const updatedService = {
                  id: doc.id,
                  ...doc.data()
                } as ServiceData;
                setSearchedService(updatedService);

                // Mostrar notificación cuando el estado cambie
                if (searchedService && searchedService.currentStatus !== updatedService.currentStatus) {
                  const oldStatus = MAINTENANCE_STATUSES.find(s => s.key === searchedService.currentStatus)?.label;
                  const newStatus = MAINTENANCE_STATUSES.find(s => s.key === updatedService.currentStatus)?.label;

                  if (oldStatus && newStatus) {
                    addToast({
                      title: 'Estado actualizado',
                      description: `El estado cambió de "${oldStatus}" a "${newStatus}"`,
                      variant: 'bordered',
                      color: 'primary',
                      timeout: 3000
                    });
                  }
                }
              }
            });

            setUnsubscribe(() => serviceUnsubscribe);
          }
          setSearchLoading(false);
        },
        (error) => {
          console.error('Error en la suscripción:', error);
          addToast({
            title: 'Error al buscar servicio',
            description: 'Intenta nuevamente',
            variant: 'bordered',
            color: 'danger'
          });
          setSearchLoading(false);
        }
      );

      setUnsubscribe(() => unsubscribeSnapshot);
    } catch (error) {
      console.error('Error buscando el servicio:', error);
      addToast({
        title: 'Error al buscar servicio',
        variant: 'bordered',
        color: 'danger'
      });
      setSearchLoading(false);
    }
  };

  // Función para procesar los mensajes del chatbot
  const processUserMessage = async (message: string) => {
    const lowerMessage = message.toLowerCase();

    // Respuestas basadas en el conocimiento de Xnorik
    let response = '';

    if (lowerMessage.includes('hola') || lowerMessage.includes('hi') || lowerMessage.includes('buenas')) {
      response = '¡Hola! Soy el asistente virtual de Xnorik. ¿En qué puedo ayudarte hoy?';
    } else if (lowerMessage.includes('qué es xnorik') || lowerMessage.includes('que es xnorik') || lowerMessage.includes('xnorik')) {
      response = XNORIK_KNOWLEDGE.about;
    } else if (lowerMessage.includes('cómo funciona') || lowerMessage.includes('como funciona') || lowerMessage.includes('funcion')) {
      response = XNORIK_KNOWLEDGE.howItWorks;
    } else if (lowerMessage.includes('servicio') || lowerMessage.includes('qué ofrecen') || lowerMessage.includes('que ofrecen')) {
      response = XNORIK_KNOWLEDGE.services;
    } else if (lowerMessage.includes('contact') || lowerMessage.includes('comunicar') || lowerMessage.includes('hablar')) {
      response = XNORIK_KNOWLEDGE.contact;
    } else if (lowerMessage.includes('seguimiento') || lowerMessage.includes('rastrear') || lowerMessage.includes('código') || lowerMessage.includes('codigo')) {
      response = XNORIK_KNOWLEDGE.tracking;
    } else if (lowerMessage.includes('estado') || lowerMessage.includes('estados') || lowerMessage.includes('progreso')) {
      response = `Estos son los estados posibles del mantenimiento:\n\n${XNORIK_KNOWLEDGE.statuses.join('\n')}`;
    } else if (lowerMessage.includes('gracias') || lowerMessage.includes('thanks')) {
      response = '¡De nada! Estoy aquí para ayudarte. Si tienes más preguntas, no dudes en consultarme.';
    } else if (lowerMessage.includes('tiempo real') || lowerMessage.includes('actualizacion') || lowerMessage.includes('actualización')) {
      response = '¡Sí! Nuestro sistema funciona en tiempo real. Cuando el técnico actualice el estado de tu equipo, lo verás inmediatamente sin necesidad de recargar la página.';
    } else {
      response = 'Lo siento, soy un asistente especializado en Xnorik. Puedo ayudarte con información sobre nuestros servicios, seguimiento de reparaciones, o explicarte cómo funciona nuestra plataforma. ¿En qué más puedo asistirte?';
    }

    return response;
  };

  const handleSendMessage = async () => {
    if (!userMessage.trim()) return;

    // Agregar mensaje del usuario
    const userMessageObj: ChatMessage = {
      id: Date.now().toString(),
      text: userMessage,
      isUser: true,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessageObj]);
    setUserMessage('');
    setIsChatLoading(true);

    // Simular procesamiento
    setTimeout(async () => {
      const response = await processUserMessage(userMessage);

      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: response,
        isUser: false,
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, botMessage]);
      setIsChatLoading(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTimestamp = (value: any) => {
    if (!value) return 'No disponible';
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
    return statusInfo ? statusInfo.progress : 0;
  }

  const getStatusDescription = (status: string | undefined): string => {
    const statusInfo = MAINTENANCE_STATUSES.find(s => s.key === status);
    return statusInfo ? statusInfo.description : 'Estado no disponible';
  }

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSearchedService(null);
    if (unsubscribe) {
      unsubscribe();
      setUnsubscribe(null);
    }
  }

  return (
    <Fragment>
      {/* Chatbot Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isChatOpen && (
          <Button
            color="primary"
            isIconOnly
            size="lg"
            className="rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            onPress={() => setIsChatOpen(true)}
          >
            <i className="fi fi-rr-robot text-white text-xl"></i>
          </Button>
        )}
      </div>

      <Modal
        isOpen={isChatOpen}
        onOpenChange={setIsChatOpen}
        size="md"
        placement="bottom-center"
        className="max-h-[80vh] text-po"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1 bg-purple-600 text-white">
            <div className="flex items-center gap-3">
              <i className="fi fi-rr-robot text-xl"></i>
              <h3 className="text-lg font-bold">Asistente Xnorik</h3>
            </div>
            <p className="text-sm font-normal opacity-90">Estoy aquí para ayudarte</p>
          </ModalHeader>
          <ModalBody className="p-0">
            <div className="h-80 overflow-y-auto p-4 space-y-4">
              {chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl p-3 ${message.isUser
                      ? 'bg-blue-500 text-white rounded-br-none'
                      : 'bg-gray-100 text-gray-800 rounded-bl-none'
                      }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                    <p className={`text-xs mt-1 ${message.isUser ? 'text-blue-100' : 'text-gray-500'}`}>
                      {message.timestamp.toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              ))}
              {isChatLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-800 rounded-2xl rounded-bl-none p-3 max-w-[80%]">
                    <div className="flex items-center gap-2">
                      <Spinner size="sm" />
                      <span className="text-sm">Escribiendo...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ModalBody>
          <ModalFooter className="p-4">
            <div className="flex gap-2 w-full">
              <Input
                placeholder="Escribe tu pregunta..."
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button
                color="primary"
                onPress={handleSendMessage}
                isDisabled={!userMessage.trim() || isChatLoading}
              >
                <i className="fi fi-rr-paper-plane"></i>
              </Button>
            </div>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Contenido principal existente */}
      <Image src={'/image-shape-three.jpg'} className='absolute top-0 right-0' alt={''} width={200} height={200} />
      <section className='h-screen rounded-xl w-full flex flex-col p-10 max-md:p-5'>
        <main className='mt-10 max-md:mt-0 flex flex-col justify-center items-center gap-10 text-po max-md:w-full'>
          <h1 className='font-extrabold text-6xl text-po text-center text-shadow text-shadow-sm text-shadow-black max-md:text-5xl max-sm:text-xl'>VISUALICE EL ESTADO DE SU COMPUTADORA</h1>
          <label className='flex max-md:w-full gap-2'>
            <Input
              label={'Ingrese El Ticket O Codigo'}
              color='secondary'
              className='rounded-l-xl w-96 max-md:w-full max-sm:h-11'
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
            />
            <Button
              color='secondary'
              onPress={handleSearchService}
              isLoading={searchLoading}
              radius='lg'
              className='h-full flex justify-center items-center gap-1 max-sm:h-11'
            >
              <i className='fi fi-rr-search flex justify-center items-ceter'></i>
              {'Buscar'}
            </Button>
          </label>
        </main>

        {searchedService && (
          <Modal
            isOpen={isModalOpen}
            onOpenChange={handleCloseModal}
            size="5xl"
            scrollBehavior="inside"
          >
            <ModalContent>
              <ModalHeader className='flex flex-col gap-1'>
                <h2 className='text-4xl text-center font-bold text-black text-po'>
                  ESTADO DEL SERVICIO - {searchedService?.trackingCode}
                </h2>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <p className='text-sm text-po text-green-600 font-medium'>
                    Conectado en tiempo real
                  </p>
                </div>
                <p className='text-sm text-po text-gray-500 text-center'>
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
                <Button color='primary' className='text-white' onPress={handleCloseModal}>
                  Cerrar
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        )}
        <Image src={'/image-shape-one.jpg'} alt={''} width={200} height={200} />
        <Image src={'/image-shape-two.jpg'} alt={''} width={200} height={200} className='absolute bottom-0 right-0' />
      </section>
      <section className='w-full h-screen bg-black flex justify-around items-center'>
        <div className='w-2/4 flex justify-center items-center flex-col gap-10 px-5 max-md:px-10 max-md:w-full max-md:justify-center max-md:items-center max-md:gap-0'>
          <h1 className='text-white text-po font-bold text-5xl text-center max-sm:text-2xl'>¿QUE ES XNORIK?</h1>
          <Image src={'/image-call.svg'} className='flex min-md:hidden' width={500} height={400} alt={'Image Call'} />
          <p className='w-full text-white text-po font-light max-sm:text-sm'>Xnorik, es un servicio web que prioriza la comunicación entre un técnico de reparación y su respectivo cliente, brindando confianza y seguridad.</p>
        </div>
        <div className='2/4 max-md:hidden'>
          <Image src={'/image-call.svg'} width={500} height={400} alt={'Image Call'} />
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
      <Footer />
    </Fragment>
  );
}