import React, { useState, useEffect, useRef } from 'react';
import { 
  ChakraProvider, 
  Box, 
  Button, 
  Heading, 
  VStack, 
  HStack, 
  Text, 
  Modal, 
  ModalOverlay, 
  ModalContent, 
  ModalBody, 
  ModalFooter, 
  useDisclosure,
  Image,
  Input,
  FormControl,
  FormLabel,
  useToast,
  Divider,
  Flex
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import Confetti from 'react-confetti';
import emailjs from '@emailjs/browser'; 
import './App.css';
import happyVideoSource from './Download.mp4'; 
import meowImageSource from './meow.jpg'; 

// --- Components ---

const ChromaKeyVideo = ({ src }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    let animationFrameId;

    const renderFrame = () => {
      if (!video || video.paused || video.ended) return;
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        animationFrameId = requestAnimationFrame(renderFrame);
        return;
      }
      if (canvas.width !== video.videoWidth) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = frame.data;
      const length = data.length;

      for (let i = 0; i < length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        if (g > 100 && g > r * 1.4 && g > b * 1.4) {
          data[i + 3] = 0; 
        }
      }
      ctx.putImageData(frame, 0, 0);
      animationFrameId = requestAnimationFrame(renderFrame);
    };

    const handlePlay = () => { renderFrame(); };
    video.addEventListener('play', handlePlay);
    video.play().catch(e => console.log("Autoplay blocked/waiting:", e));

    return () => {
      video.removeEventListener('play', handlePlay);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <Box boxSize="300px" display="flex" justifyContent="center" alignItems="center">
      <video ref={videoRef} src={src} loop muted playsInline crossOrigin="anonymous" style={{ display: 'none' }} />
      <canvas ref={canvasRef} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
    </Box>
  );
};

const FloatingHearts = () => {
  const [hearts, setHearts] = useState([]);
  useEffect(() => {
    const newHearts = Array.from({ length: 20 }).map((_, i) => ({
      id: i, left: Math.random() * 100, duration: Math.random() * 5 + 5, delay: Math.random() * 5,
    }));
    setHearts(newHearts);
  }, []);

  return (
    <Box position="fixed" top={0} left={0} w="100%" h="100%" overflow="hidden" zIndex={0} pointerEvents="none">
      {hearts.map((heart) => (
        <motion.div key={heart.id} style={{ position: 'absolute', left: `${heart.left}%`, bottom: '-10%', fontSize: '2rem' }}
          initial={{ y: 0, opacity: 0 }}
          animate={{ y: -1000, opacity: [0, 1, 0], rotate: [0, 20, -20, 0] }}
          transition={{ duration: heart.duration, repeat: Infinity, delay: heart.delay, ease: "linear" }}>
          ❤️
        </motion.div>
      ))}
    </Box>
  );
};

const MotionButton = motion(Button);

// 3. Main App Component
function App() {
  const [stage, setStage] = useState(0); 
  const [answers, setAnswers] = useState({ name: '', game: '', watch: '', date: '', email: '' });
  const [isSending, setIsSending] = useState(false);

  const [noBtnPosition, setNoBtnPosition] = useState({ x: 0, y: 0 });
  const [hoverCount, setHoverCount] = useState(0);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const toast = useToast();

  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
  }, []);

  const handleNoHover = () => {
    const x = (Math.random() - 0.5) * 300; 
    const y = (Math.random() - 0.5) * 300;
    setNoBtnPosition({ x, y });
    setHoverCount((prev) => prev + 1);
  };

  const handleFinalSubmit = () => {
    if (!answers.name || !answers.date || !answers.email) {
      toast({
        title: "Please fill in everything! 🥺",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsSending(true);

    const templateParams = {
      to_name: answers.name,  
      from_name: 'Maki',
      to_email: answers.email, 
      game: answers.game,      
      watch: answers.watch,    
      date_time: new Date(answers.date).toLocaleString(), 
    };

    // YOUR KEYS
    const SERVICE_ID = 'service_065z3xr';
    const TEMPLATE_ID = 'template_8e57e0o';
    const PUBLIC_KEY = 'lSC4yp_WRfka-MleD';

    emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY)
      .then((response) => {
        setIsSending(false);
        setStage(4);
        onOpen();
        toast({
          title: "Receipt Sent! 📧",
          description: `Sent to ${answers.email}`,
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      }, (err) => {
        setIsSending(false);
        console.error("Email Error:", err);
        toast({
          title: "Email failed... but I still love you!",
          description: "Proceeding anyway! ❤️",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        setStage(4);
        onOpen();
      });
  };

  const noButtonTexts = ["No", "Are you sure?", "Really sure?", "Think again!", "Last chance!", "Surely not?", "You might regret this!", "Have a heart!", "Don't be so cold!", "PLEASE! 😭"];

  return (
    <ChakraProvider>
      <Box className="App" h="100vh" w="100vw" bgGradient="linear(to-br, pink.100, white)" display="flex" justifyContent="center" alignItems="center" position="relative" overflow="hidden">
        <FloatingHearts />
        {stage === 4 && <Confetti width={windowSize.width} height={windowSize.height} numberOfPieces={500} recycle={false} />}

        <VStack spacing={8} zIndex={10} textAlign="center" p={6} bg="rgba(255, 255, 255, 0.85)" borderRadius="3xl" boxShadow="2xl" backdropFilter="blur(10px)" maxW="90%" border="2px solid" borderColor="pink.200">
          
          {/* STAGE 0: Question */}
          {stage === 0 && (
            <>
              {/* Image */}
              <Image 
                boxSize="250px" 
                src={meowImageSource} 
                alt="Meow Valentine" 
                objectFit="cover" 
                borderRadius="full"
                boxShadow="md"
              />
              <Heading as="h1" size="2xl" color="pink.600" mt={4}>Will you be my Valentine?</Heading>
              <HStack spacing={8} mt={4}>
                <Button size="lg" colorScheme="pink" height="60px" width="120px" fontSize="xl" boxShadow="xl" _hover={{ transform: 'scale(1.1)' }} onClick={() => setStage(1)}>Yes 🥰</Button>
                <MotionButton size="lg" colorScheme="gray" variant="outline" height="60px" minW="120px" fontSize="xl" bg="white" animate={{ x: noBtnPosition.x, y: noBtnPosition.y }} transition={{ type: "spring", stiffness: 300, damping: 20 }} onMouseEnter={handleNoHover} onClick={handleNoHover}>
                  {noButtonTexts[Math.min(hoverCount, noButtonTexts.length - 1)]}
                </MotionButton>
              </HStack>
            </>
          )}

          {/* STAGE 1: Game */}
          {stage === 1 && (
            <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }}>
              <VStack spacing={6}>
                <Text fontSize="4xl">🎮</Text>
                <Heading size="xl" color="pink.500">What do you want to play?</Heading>
                <HStack spacing={6}>
                  <Button size="lg" colorScheme="red" w="150px" onClick={() => { setAnswers({ ...answers, game: 'Valorant' }); setStage(2); }}>Valorant</Button>
                  <Button size="lg" colorScheme="purple" w="150px" onClick={() => { setAnswers({ ...answers, game: 'Genshin' }); setStage(2); }}>Genshin</Button>
                </HStack>
              </VStack>
            </motion.div>
          )}

          {/* STAGE 2: Watch */}
          {stage === 2 && (
            <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }}>
               <VStack spacing={6}>
                <Text fontSize="4xl">🍿</Text>
                <Heading size="xl" color="pink.500">Do you want to watch?</Heading>
                <HStack spacing={6}>
                  <Button size="lg" colorScheme="teal" w="150px" onClick={() => { setAnswers({ ...answers, watch: 'Series' }); setStage(3); }}>Series</Button>
                  <Button size="lg" colorScheme="orange" w="150px" onClick={() => { setAnswers({ ...answers, watch: 'Movies' }); setStage(3); }}>Movies</Button>
                </HStack>
              </VStack>
            </motion.div>
          )}

          {/* STAGE 3: Date, Name & Email */}
          {stage === 3 && (
            <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }}>
               <VStack spacing={5} w="100%">
                <Heading size="lg" color="pink.500">Last Step! 💌</Heading>
                
                {/* NAME INPUT */}
                <FormControl isRequired>
                  <FormLabel textAlign="center" color="gray.600">Your Name:</FormLabel>
                  <Input 
                    type="text" 
                    placeholder="e.g., maki" 
                    bg="white" 
                    onChange={(e) => setAnswers({ ...answers, name: e.target.value })} 
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel textAlign="center" color="gray.600">When are you free?</FormLabel>
                  <Input type="datetime-local" bg="white" onChange={(e) => setAnswers({ ...answers, date: e.target.value })} />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel textAlign="center" color="gray.600">Email for your receipt:</FormLabel>
                  <Input type="email" placeholder="cutemotlga@gmail.com" bg="white" onChange={(e) => setAnswers({ ...answers, email: e.target.value })} />
                </FormControl>

                <Button size="lg" colorScheme="pink" onClick={handleFinalSubmit} isLoading={isSending} loadingText="Sending...">
                  Send & Finish 💖
                </Button>
              </VStack>
            </motion.div>
          )}

          {/* STAGE 4: Final Happy Page */}
          {stage === 4 && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
              <VStack spacing={4}>
                <ChromaKeyVideo src={happyVideoSource} />
                <Heading as="h1" size="2xl" color="pink.600" textShadow="1px 1px 0 white">YAY! Happy Happy Happy! 💖</Heading>
                <Text fontSize="md" color="gray.500">Receipt sent to {answers.email}!</Text>
                <Button variant="link" color="pink.500" onClick={onOpen} fontSize="xl">View Receipt 🧾</Button>
              </VStack>
            </motion.div>
          )}
        </VStack>

        {/* --- RECEIPT STYLE MODAL (MATCHING EMAIL HTML) --- */}
        <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
          <ModalOverlay backdropFilter="blur(4px)" />
          {/* Wrapper to simulate the pink background of the email */}
          <ModalContent bg="transparent" boxShadow="none" my="auto">
            <Box 
              bg="#ffe6eb" 
              p={10} 
              borderRadius="md" 
              fontFamily="'Courier New', Courier, monospace"
              w="100%"
            >
              <Box 
                bg="white" 
                maxW="350px" 
                mx="auto" 
                p={5} 
                borderRadius="10px" 
                boxShadow="0 4px 15px rgba(0,0,0,0.1)"
              >
                
                {/* Header */}
                <Box textAlign="center">
                  <Heading color="#ff6b81" m={0} fontSize="24px" letterSpacing="2px">RECEIPT</Heading>
                  <Text fontSize="12px" color="#bbb" mt="5px" mb="15px">ORDER #143-LOVEUMWA</Text>
                </Box>

                {/* Customer Info Box */}
                <Box bg="#fff0f3" p={2} borderRadius="5px" fontSize="12px" color="#555" mb="10px">
                  <Text m="2px 0">CUSTOMER: <Text as="strong" color="#ff6b81" textTransform="uppercase">{answers.name || 'VALENTINE'}</Text></Text>
                  <Text m="2px 0">SERVER: <Text as="strong" color="#ff6b81" textTransform="uppercase">MAKI</Text></Text>
                </Box>

                <Box borderBottom="2px dashed #ffb7c5" my="20px"></Box>
                
                {/* Activities Header */}
                <Box borderBottom="2px dashed rgb(255, 183, 197)" my="20px" textAlign="center" color="#555" fontSize="14px">
                  Activities
                </Box>

                {/* Table Items */}
                <VStack spacing={2} align="stretch" fontSize="14px" color="#555">
                  <Flex justify="space-between" align="start">
                    <Text py="10px">Gaming</Text>
                    <Text textAlign="right" fontWeight="bold" color="#ff6b81" py="10px">{answers.game}</Text>
                  </Flex>
                  <Flex justify="space-between" align="start">
                    <Text py="10px">Movie</Text>
                    <Text textAlign="right" fontWeight="bold" color="#ff6b81" py="10px">{answers.watch}</Text>
                  </Flex>
                  <Flex justify="space-between" align="start">
                    <Text py="10px">Date</Text>
                    <Text textAlign="right" fontWeight="bold" color="#ff6b81" py="10px" maxW="120px" wordBreak="break-word">
                      {answers.date ? new Date(answers.date).toLocaleString() : "TBD"}
                    </Text>
                  </Flex>
                </VStack>

                <Box borderBottom="2px dashed #ffb7c5" my="20px"></Box>

                {/* Total */}
                <Flex justify="space-between" align="center" fontSize="16px" fontWeight="bold">
                  <Text>TOTAL:</Text>
                  <Text textAlign="right" color="#ff6b81" fontSize="20px">MY HEART 💖</Text>
                </Flex>

                {/* Footer */}
                <Box mt="30px" fontSize="11px" color="#aaa" textAlign="center" lineHeight="1.5">
                  <Text m={0}>***********************************</Text>
                  <Text m="5px 0">NON-REFUNDABLE • LIFETIME WARRANTY</Text>
                  <Text m={0}>***********************************</Text>
                  <Text mt="10px">Sent with love by Maki 💌</Text>
                </Box>

              </Box>
              
              {/* Close Button placed outside or below for cleaner look */}
              <Flex justify="center" mt={4}>
                 <Button colorScheme="pink" size="sm" onClick={onClose}>Close Receipt</Button>
              </Flex>
            </Box>
          </ModalContent>
        </Modal>

      </Box>
    </ChakraProvider>
  );
}

export default App;