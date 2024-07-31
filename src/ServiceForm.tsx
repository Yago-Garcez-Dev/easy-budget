import React, { useState } from 'react';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css'; // Importa os estilos
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import logoImg from './assets/images/image.png'

interface Service {
  id: number;
  name: string;
  details?: string;
  unit: string;
  price: string; // Alterado para string para exibição formatada
  quantity: string;
}

const ServiceForm: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [clientName, setClientName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');

  const proposalDate = new Date();
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + 14);

  const [service, setService] = useState<Service>({
    id: Date.now(),
    name: '',
    details: '',
    unit: '',
    price: '',
    quantity: '',
  });

  const [isEditing, setIsEditing] = useState(false); // Estado para controlar se está editando um serviço

  const unitOptions = [
    'un',
    'm²',
    'km²',
    'ha',
    'mm',
    'cm',
    'm',
    'km',
    'mL',
    'L',
    'm³',
    'min',
    'h',
    'dias',
    'semanas',
    'meses',
    'g',
    'kg',
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'price') {
      // Remove tudo o que não for dígito
      const formattedValue = value.replace(/[^\d]/g, '');

      // Formatação do preço
      const formattedPrice = Number(Number(formattedValue) / 100).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      });

      setService({ ...service, [name]: formattedPrice });
    } else {
      setService({ ...service, [name]: value });
    }
  };

  const addOrUpdateService = () => {
    if (service.name && service.unit && service.price && service.quantity) {
      if (isEditing) {
        // Atualizar serviço existente
        const updatedServices = services.map((s) => (s.id === service.id ? { ...service } : s));
        setServices(updatedServices);
      } else {
        // Adicionar novo serviço
        const newService: Service = {
          ...service,
          id: Date.now(),
        };
        setServices([...services, newService]);
      }

      setService({ id: Date.now(), name: '', details: '', unit: '', price: '', quantity: '' });
      setIsEditing(false); // Resetar o estado de edição após adicionar/atualizar serviço
    } else {
      alert('Por favor, preencha todos os campos obrigatórios');
    }
  };

  const removeService = (id: number) => {
    setServices(services.filter((service) => service.id !== id));
  };

  const editService = (id: number) => {
    const serviceToEdit = services.find((service) => service.id === id);
    if (serviceToEdit) {
      setService({
        ...serviceToEdit,
      });
      setIsEditing(true); // Marcar que estamos editando um serviço
    }
  };

  const clearServices = () => {
    setServices([]);
  };

  const formatCurrency = (value: string) => {
    return Number(value).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const handleGeneratePDF = async () => {
    if (!clientName || !email || !whatsapp) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const pdfDoc = await PDFDocument.create();
    const pageWidth = 595.276; // A4 width in points
    const pageHeight = 841.890; // A4 height in points
    let yPosition = pageHeight - 50;
    let totalServices = 0;

    const addPage = () => {
      const page = pdfDoc.addPage([pageWidth, pageHeight]);
      return page;
    };

    let page = addPage();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Adicionar logo
    const logoImageBytes = await fetch(logoImg).then(res => res.arrayBuffer());
    const logoImage = await pdfDoc.embedPng(logoImageBytes);
    const logoDims = logoImage.scale(0.4); // Ajuste o tamanho do logo conforme necessário
    page.drawImage(logoImage, {
      x: 50, // Centralizar horizontalmente
      y: pageHeight - logoDims.height - 50, // Margem superior
      width: logoDims.width,
      height: logoDims.height,
    });

    // Centralizar texto "Proposta Comercial"
    yPosition -= logoDims.height + 40;
    const text = 'Proposta Comercial';
    const textWidth = font.widthOfTextAtSize(text, 20);
    page.drawText(text, {
      x: (pageWidth - textWidth) / 2, // Centralizar horizontalmente
      y: yPosition,
      size: 20,
      font,
      color: rgb(0, 0, 0),
    });
    yPosition -= 30;

    // Cabeçalho
    page.drawText(`Cliente: ${clientName}`, { x: 50, y: yPosition, size: 12, font, color: rgb(0, 0, 0) });
    yPosition -= 20;
    page.drawText(`E-mail: ${email}`, { x: 50, y: yPosition, size: 12, font, color: rgb(0, 0, 0) });
    yPosition -= 20;
    page.drawText(`WhatsApp: ${whatsapp}`, { x: 50, y: yPosition, size: 12, font, color: rgb(0, 0, 0) });
    yPosition -= 20;
    page.drawText(`Data da Proposta: ${proposalDate.toLocaleDateString('pt-BR')}`, { x: 50, y: yPosition, size: 12, font, color: rgb(0, 0, 0) });
    yPosition -= 20;

    // Linha divisória
    page.drawLine({
      start: { x: 50, y: yPosition },
      end: { x: pageWidth - 50, y: yPosition },
      thickness: 1,
      color: rgb(0, 0, 0),
    });
    yPosition -= 20;

    // Listagem de serviços
    services.forEach((service, index) => {
      if (yPosition < 100) {
        page = addPage();
        yPosition = pageHeight - 50;
      }

      yPosition -= 20;
      page.drawText(`Serviço ${index + 1}`, { x: 50, y: yPosition, size: 14, font, color: rgb(0, 0, 0) });
      yPosition -= 20;
      page.drawText(`Nome: ${service.name}`, { x: 70, y: yPosition, size: 12, font, color: rgb(0, 0, 0) });
      yPosition -= 15;
      if (service.details) {
        page.drawText(`Detalhes: ${service.details}`, { x: 70, y: yPosition, size: 12, font, color: rgb(0, 0, 0) });
        yPosition -= 15;
      }
      page.drawText(`Unidade: ${service.unit}`, { x: 70, y: yPosition, size: 12, font, color: rgb(0, 0, 0) });
      yPosition -= 15;
      page.drawText(`Preço Unitário: ${service.price}`, { x: 70, y: yPosition, size: 12, font, color: rgb(0, 0, 0) });
      yPosition -= 15;
      page.drawText(`Quantidade: ${service.quantity}`, { x: 70, y: yPosition, size: 12, font, color: rgb(0, 0, 0) });
      yPosition -= 20;
      const totalPrice = Number(parseFloat(service.price.replace(/[^\d,]/g, '').replace(',', '.'))) * Number(service.quantity);
      page.drawText(`Total: ${formatCurrency(totalPrice.toString())}`, { x: 70, y: yPosition, size: 12, font, color: rgb(0, 0, 0) });
      yPosition -= 30;
      totalServices += totalPrice;
    });

    // Linha divisória
    page.drawLine({
      start: { x: 50, y: yPosition },
      end: { x: pageWidth - 50, y: yPosition },
      thickness: 1,
      color: rgb(0, 0, 0),
    });
    yPosition -= 20;

    // Total dos serviços
    page.drawText(`Total dos Serviços: ${formatCurrency(totalServices.toString())}`, { x: 50, y: yPosition, size: 14, font, color: rgb(0, 0, 0) });
    yPosition -= 30;

    // Forma de pagamento
    page.drawText(`Forma de Pagamento: À vista e cartões de crédito e débito. `, { x: 50, y: yPosition, size: 12, font, color: rgb(0, 0, 0) });
    yPosition -= 20;

    // Validade da proposta
    page.drawText(`Validade da proposta: ${expirationDate.toLocaleDateString('pt-BR')}`, { x: 50, y: yPosition, size: 12, font, color: rgb(0, 0, 0) });

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const fileName = `proposta_comercial_${clientName.trim().replace(/\s+/g, '_').toLowerCase()}.pdf`;
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Gerar Orçamento</h1>

      {/* Seção de Dados do Cliente */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Dados do Cliente</h2>
        <input
          type="text"
          name="clientName"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          placeholder="Nome do cliente"
          className="border p-2 mb-2 w-full"
        />
        <input
          type="text"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-mail do cliente"
          className="border p-2 mb-2 w-full"
        />
        <PhoneInput
          placeholder="WhatsApp do cliente"
          value={whatsapp}
          onChange={(value) => setWhatsapp(value || '')}
          defaultCountry="BR" // Define o país padrão para o Brasil
          className="border p-2 mb-2 w-full"
        />
      </div>

      {/* Linha divisória */}
      <hr className="my-6" />

      {/* Seção de Serviços */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Serviços</h2>
        <input
          type="text"
          name="name"
          value={service.name}
          onChange={handleChange}
          placeholder="Nome do serviço"
          className="border p-2 mb-2 w-full"
        />
        <textarea
          name="details"
          value={service.details}
          onChange={handleChange}
          placeholder="Detalhes do serviço (opcional)"
          className="border p-2 mb-2 w-full"
        />
        <select
          name="unit"
          value={service.unit}
          onChange={handleChange}
          className="border p-2 mb-2 w-full"
        >
          <option value="">Selecione a unidade de medida</option>
          {unitOptions.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
        <input
          type="text"
          name="price"
          value={service.price}
          onChange={handleChange}
          placeholder="Preço unitário (R$)"
          className="border p-2 mb-2 w-full"
        />
        <input
          type="text"
          name="quantity"
          value={service.quantity}
          onChange={handleChange}
          placeholder="Quantidade"
          className="border p-2 mb-2 w-full"
        />
        <button onClick={addOrUpdateService} className={`p-2 ${isEditing ? 'bg-yellow-500' : 'bg-blue-500'} text-white`}>
          {isEditing ? 'Atualizar Serviço' : 'Adicionar Serviço'}
        </button>
        <button onClick={clearServices} className="bg-red-500 text-white p-2 ml-2">
          Limpar Todos
        </button>
      </div>

      {services.map((service) => (
        <div key={service.id} className="border p-2 mb-2">
          <h2 className="font-bold">{service.name}</h2>
          <p>Detalhes: {service.details || 'N/A'}</p>
          <p>Unidade: {service.unit}</p>
          <p>Preço Unitário: {service.price}</p>
          <p>Quantidade: {service.quantity}</p>
          <p className="font-bold">Total: {formatCurrency((Number(parseFloat(service.price.replace(/[^\d,]/g, '').replace(',', '.'))) * Number(service.quantity)).toString())}</p>
          <button onClick={() => editService(service.id)} className="bg-yellow-500 text-white p-2 mr-2">
            Editar
          </button>
          <button onClick={() => removeService(service.id)} className="bg-red-500 text-white p-2">
            Remover
          </button>
        </div>
      ))}

      <button onClick={handleGeneratePDF} className="bg-green-500 text-white p-2 mt-4">
        Gerar PDF
      </button>
    </div>
  );
};

export default ServiceForm;
