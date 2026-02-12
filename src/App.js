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
  useDisclosure,
  Image,
  Input,
  FormControl,
  FormLabel,
  useToast,
  Flex
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import Confetti from 'react-confetti';
import emailjs from '@emailjs/browser'; 
import './App.css';
import happyVideoSource from './Download.mp4'; 
import meowImageSource from './meow.jpg'; 
import capyValenImageSource from './capyvalent.png'; 

// --- Timeline Data ---
const timelineData = [
  {
    title: "Where it all began",
    message: "I knew from the moment we met that you were someone special.",
    image: meowImageSource 
  },
  {
    title: "Our First Favorite Memory",
    message: "Every laugh we've shared is tucked away in my heart.",
    image: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400" 
  },
  {
    title: "Looking Forward",
    message: "I can't wait to see what the future holds for us.",
    image: "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?w=400"
  }
];

// --- Sub-Components ---

const TimelineItem = ({ item, isLast }) => {
  return (
    <VStack spacing={0} w="full" position="relative">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        style={{ width: '100%' }}
      >
        <VStack spacing={4} align="center">
          <Box bg="pink.400" color="white" px={4} py={1} borderRadius="full" fontSize="xs" fontWeight="bold" zIndex={2}>
            {item.title}
          </Box>
          <Image 
            src={item.image} 
            boxSize="220px" 
            objectFit="cover" 
            borderRadius="2xl" 
            shadow="xl" 
            border="4px solid white" 
            zIndex={2}
          />
          <Text fontSize="md" color="gray.600" fontStyle="italic" textAlign="center" maxW="280px" zIndex={2}>
            "{item.message}"
          </Text>
        </VStack>
      </motion.div>

      {!isLast && (
        <Box 
          w="2px" 
          h="100px" 
          borderLeft="2px dashed" 
          borderColor="pink.300" 
          my={4}
          opacity={0.6}
        />
      )}
    </VStack>
  );
};

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
      if (!video || video.paused || video.ended || video.readyState < 2) {
        animationFrameId = requestAnimationFrame(renderFrame);
        return;
      }

      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        if (video.videoWidth > 0 && video.videoHeight > 0) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        } else {
          animationFrameId = requestAnimationFrame(renderFrame);
          return;
        }
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = frame.data;
      
      for (let i = 0; i < data.length; i += 4) {
        if (data[i+1] > 100 && data[i+1] > data[i] * 1.4 && data[i+1] > data[i+2] * 1.4) {
          data[i+3] = 0;
        }
      }
      ctx.putImageData(frame, 0, 0);
      animationFrameId = requestAnimationFrame(renderFrame);
    };

    video.addEventListener('play', renderFrame);
    video.play().catch(e => console.log("Video initializing..."));
    
    return () => {
      cancelAnimationFrame(animationFrameId);
      video.removeEventListener('play', renderFrame);
    };
  }, [src]);

  return (
    <Box boxSize="300px" display="flex" justifyContent="center">
      <video 
        ref={videoRef} 
        src={src} 
        loop 
        muted 
        playsInline 
        crossOrigin="anonymous" 
        style={{ display: 'none' }} 
      />
      <canvas ref={canvasRef} style={{ maxWidth: '100%', maxHeight: '100%' }} />
    </Box>
  );
};

const FloatingBackground = () => {
  const [elements, setElements] = useState([]);
  useEffect(() => {
    const items = ['❤️', '🌸', '💕', '🌸', '✨'];
    setElements(Array.from({ length: 20 }).map((_, i) => ({
      id: i, 
      left: Math.random() * 100, 
      duration: Math.random() * 5 + 6, 
      delay: Math.random() * 5,
      icon: items[Math.floor(Math.random() * items.length)],
      size: Math.random() * 1.5 + 1
    })));
  }, []);
  return (
    <Box position="fixed" top={0} left={0} w="100%" h="100%" overflow="hidden" zIndex={0} pointerEvents="none">
      {elements.map(e => (
        <motion.div key={e.id} style={{ position: 'absolute', left: `${e.left}%`, bottom: '-10%', fontSize: `${e.size}rem` }}
          animate={{ y: -1200, opacity: [0, 1, 1, 0], rotate: 360 }} transition={{ duration: e.duration, repeat: Infinity, delay: e.delay, ease: "linear" }}>
          {e.icon}
        </motion.div>
      ))}
    </Box>
  );
};

function App() {
  const [stage, setStage] = useState(0); 
  const [answers, setAnswers] = useState({ name: '', game: '', watch: '', date: '', email: '' });
  const [isSending, setIsSending] = useState(false);
  const [noBtnPosition, setNoBtnPosition] = useState({ x: 0, y: 0 });
  const [hoverCount, setHoverCount] = useState(0);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const handleNoHover = () => {
    setNoBtnPosition({ x: (Math.random() - 0.5) * 300, y: (Math.random() - 0.5) * 300 });
    setHoverCount((prev) => prev + 1);
  };

  const handleFinalSubmit = () => {
    if (!answers.name || !answers.date || !answers.email) {
      toast({ title: "Please fill in everything! 🥺", status: "warning", duration: 3000 });
      return;
    }
    setIsSending(true);
    emailjs.send('service_065z3xr', 'template_8e57e0o', {
      to_name: answers.name, 
      from_name: 'Maki', 
      to_email: answers.email,
      game: answers.game, 
      watch: answers.watch, 
      date_time: new Date(answers.date).toLocaleString(), 
    }, 'lSC4yp_WRfka-MleD')
      .then(() => { setIsSending(false); setStage(4); onOpen(); })
      .catch(() => { setIsSending(false); setStage(4); onOpen(); });
  };

  const noButtonTexts = ["No", "Sure?", "Really?", "Think again!", "Last chance!", "PLEASE! 😭"];

  return (
    <ChakraProvider>
      <Box minH="100vh" w="100vw" bgGradient="linear(to-br, pink.100, white)" position="relative" overflowX="hidden">
        <FloatingBackground />
        {stage === 4 && <Confetti numberOfPieces={500} recycle={false} />}

        <VStack spacing={20} pt={20} pb={40} px={6} zIndex={10} position="relative">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }}>
            <VStack spacing={4}>
              <Text fontFamily="'Dancing Script', cursive" fontSize={["4xl", "6xl"]} color="pink.500" textAlign="center">
                Happy Valentine's Day
              </Text>
              <Text color="gray.400" letterSpacing="widest" fontSize="sm">SCROLL FOR A SURPRISE</Text>
              <Text fontSize="2xl" color="pink.300">↓</Text>
            </VStack>
          </motion.div>

          <VStack w="full" maxW="500px" spacing={0}>
            {timelineData.map((item, idx) => (
              <TimelineItem key={idx} item={item} isLast={idx === timelineData.length - 1} />
            ))}
          </VStack>

          <VStack 
            spacing={8} 
            p={10} 
            bg="rgba(255, 255, 255, 0.75)" 
            borderRadius="3xl" 
            boxShadow="2xl" 
            backdropFilter="blur(8px)" 
            w="full"
            maxW="450px" 
            border="2px solid" 
            borderColor="rgba(255, 182, 193, 0.4)"
            position="relative"
          >
            {stage === 0 && (
              <VStack spacing={6}>
                <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
                  <Box p={1} borderRadius="full" bgGradient="linear(to-tr, pink.200, pink.500)" boxShadow="0px 10px 25px rgba(255, 107, 129, 0.4)">
                    <Image boxSize={["200px", "250px"]} src={capyValenImageSource} alt="Capy Valentine" objectFit="cover" borderRadius="full" border="4px solid white" />
                  </Box>
                </motion.div>
                <Heading fontFamily="'Dancing Script', cursive" fontSize={["4xl", "5xl"]} color="pink.600" textAlign="center">
                  Will you be my Valentine?
                </Heading>
                <HStack spacing={8} pt={4}>
                  <Button size="lg" colorScheme="pink" h="65px" w="130px" onClick={() => setStage(1)}>Yes 🥰</Button>
                  <motion.div animate={{ x: noBtnPosition.x, y: noBtnPosition.y }}>
                    <Button size="lg" colorScheme="gray" variant="outline" h="65px" minW="130px" bg="white" onMouseEnter={handleNoHover} onClick={handleNoHover}>
                      {noButtonTexts[Math.min(hoverCount, noButtonTexts.length - 1)]}
                    </Button>
                  </motion.div>
                </HStack>
              </VStack>
            )}

            {stage === 1 && (
              <VStack spacing={6}>
                <Text fontSize="4xl">🎮</Text>
                <Heading size="lg" color="pink.500">What do you want to play?</Heading>
                <HStack spacing={6}>
                  <Button colorScheme="red" onClick={() => { setAnswers({ ...answers, game: 'Valorant' }); setStage(2); }}>Valorant</Button>
                  <Button colorScheme="purple" onClick={() => { setAnswers({ ...answers, game: 'Genshin' }); setStage(2); }}>Genshin</Button>
                </HStack>
              </VStack>
            )}

            {stage === 2 && (
              <VStack spacing={6}>
                <Text fontSize="4xl">🍿</Text>
                <Heading size="lg" color="pink.500">Do you want to watch?</Heading>
                <HStack spacing={6}>
                  <Button colorScheme="teal" onClick={() => { setAnswers({ ...answers, watch: 'Series' }); setStage(3); }}>Series</Button>
                  <Button colorScheme="orange" onClick={() => { setAnswers({ ...answers, watch: 'Movies' }); setStage(3); }}>Movies</Button>
                </HStack>
              </VStack>
            )}

            {stage === 3 && (
              <VStack spacing={5} w="100%">
                <Heading size="lg" color="pink.500">Last Step! 💌</Heading>
                <FormControl isRequired><FormLabel>Your Name:</FormLabel><Input bg="white" onChange={e => setAnswers({ ...answers, name: e.target.value })} /></FormControl>
                <FormControl isRequired><FormLabel>When are you free?</FormLabel><Input type="datetime-local" bg="white" onChange={e => setAnswers({ ...answers, date: e.target.value })} /></FormControl>
                <FormControl isRequired><FormLabel>Email for receipt:</FormLabel><Input type="email" bg="white" onChange={e => setAnswers({ ...answers, email: e.target.value })} /></FormControl>
                <Button size="lg" colorScheme="pink" w="full" onClick={handleFinalSubmit} isLoading={isSending}>Send & Finish 💖</Button>
              </VStack>
            )}

            {stage === 4 && (
              <VStack spacing={4} align="center" w="full">
                {/* Repositioned Heading to overlap the top of the video area */}
                <Box position="absolute" top="10%" zIndex={20} w="full" px={4}>
                   <Heading as="h1" size="xl" color="pink.600" textAlign="center" textShadow="2px 2px 4px rgba(255,255,255,0.8)">
                    I LOVE YOU!💕 SEE YOU SOON! 💖
                  </Heading>
                </Box>
                <ChromaKeyVideo src={happyVideoSource} />
                <Button variant="link" color="pink.500" onClick={onOpen} fontSize="xl">View Receipt 🧾</Button>
              </VStack>
            )}
          </VStack>
        </VStack>

        <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
          <ModalOverlay backdropFilter="blur(4px)" />
          <ModalContent bg="transparent" boxShadow="none">
            <Box bg="#ffe6eb" p={8} borderRadius="md" position="relative" fontFamily="'Courier New', Courier, monospace">
               <Text textAlign="center" fontSize="20px" mb={2}>🌸 💕 🌸 💕</Text>
              <Box bg="white" maxW="350px" mx="auto" p={5} borderRadius="10px" boxShadow="0 4px 15px rgba(0,0,0,0.1)" border="1px solid #ffb7c5">
                <Box textAlign="center">
                  <Heading color="#ff6b81" m={0} fontSize="24px" letterSpacing="2px">RECEIPT</Heading>
                  <Text fontSize="12px" color="#bbb" mt="5px" mb="15px">ORDER #143-LOVEUMWA</Text>
                </Box>
                <Box bg="#fff0f3" p={3} borderRadius="5px" fontSize="12px" color="#555" mb="10px" borderLeft="3px solid #ff6b81">
                  <Text m="2px 0">CUSTOMER: <Text as="strong" color="#ff6b81" textTransform="uppercase">{answers.name || 'VALENTINE'}</Text></Text>
                  <Text m="2px 0">SERVER: <Text as="strong" color="#ff6b81" textTransform="uppercase">MAKI</Text></Text>
                </Box>
                <Box borderBottom="2px dashed #ffb7c5" my="20px"></Box>
                <Text color="#ff6b81" textAlign="center" fontWeight="bold" fontSize="14px" mb={2}>💖 ACTIVITIES 💖</Text>
                <VStack spacing={2} align="stretch" fontSize="14px" color="#555">
                  <Flex justify="space-between"><Text>🎮 Gaming</Text><Text fontWeight="bold" color="#ff6b81">{answers.game}</Text></Flex>
                  <Flex justify="space-between"><Text>🍿 Movie</Text><Text fontWeight="bold" color="#ff6b81">{answers.watch}</Text></Flex>
                  <Flex justify="space-between"><Text>📅 Date</Text><Text fontWeight="bold" color="#ff6b81" textAlign="right" maxW="150px">{answers.date ? new Date(answers.date).toLocaleString() : "TBD"}</Text></Flex>
                </VStack>
                <Box borderBottom="2px dashed #ffb7c5" my="20px"></Box>
                <Flex justify="space-between" align="center" fontSize="16px" fontWeight="bold">
                  <Text>TOTAL:</Text><Text color="#ff6b81" fontSize="20px">MY HEART 💖</Text>
                </Flex>
                <Box mt="30px" fontSize="11px" color="#aaa" textAlign="center">
                  <Text>🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸</Text>
                  <Text my={1}>NON-REFUNDABLE • LIFETIME WARRANTY</Text>
                  <Text>🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸</Text>
                  <Text mt="10px" fontStyle="italic">Sent with love by Maki 💌</Text>
                </Box>
              </Box>
              <Text textAlign="center" fontSize="20px" mt={2}>💕 🌸 💕 🌸</Text>
              <Flex justify="center" mt={4}><Button colorScheme="pink" size="sm" onClick={onClose}>Close Receipt</Button></Flex>
            </Box>
          </ModalContent>
        </Modal>
      </Box>
    </ChakraProvider>
  );
}

export default App;