import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="w-full py-6 mt-auto">
      <div className="container mx-auto px-4 text-center text-sm text-slate-500">
        <p>&copy; {new Date().getFullYear()} ValoraProducto IA. Todos los derechos reservados.</p>
        <div className="mt-2 space-x-4">
          {/* Replace # with actual links if needed */}
          <a href="#" className="hover:text-indigo-400">Acerca de</a>
          <a href="#" className="hover:text-indigo-400">Privacidad</a>
          <a href="#" className="hover:text-indigo-400">Contacto</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;