
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-400">
      <motion.div 
        className="text-center p-8 rounded-xl bg-gray-300/80 backdrop-blur-sm shadow-xl border border-gray-400/50"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.h1 
          className="text-4xl font-bold mb-6 text-gray-900"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          Log in voor je BRO voortgang!
        </motion.h1>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          <Button 
            onClick={() => navigate('/login')}
            className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-2"
          >
            Naar Login
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Index;
