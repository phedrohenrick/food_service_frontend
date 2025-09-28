import React, { useState } from 'react';
import { Button, Input } from '../../../../shared/components/ui';

const Settings = () => {
  const [restaurantInfo, setRestaurantInfo] = useState({
    name: 'Restaurante Exemplo',
    email: 'contato@restaurante.com',
    phone: '(11) 99999-9999',
    address: 'Rua das Flores, 123',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01234-567',
    description: 'Um restaurante incrível com comida deliciosa',
    deliveryFee: '5.00',
    minOrderValue: '20.00',
    deliveryTime: '30-45',
  });

  const [operatingHours, setOperatingHours] = useState({
    monday: { open: '08:00', close: '22:00', closed: false },
    tuesday: { open: '08:00', close: '22:00', closed: false },
    wednesday: { open: '08:00', close: '22:00', closed: false },
    thursday: { open: '08:00', close: '22:00', closed: false },
    friday: { open: '08:00', close: '23:00', closed: false },
    saturday: { open: '09:00', close: '23:00', closed: false },
    sunday: { open: '09:00', close: '21:00', closed: false },
  });

  const dayNames = {
    monday: 'Segunda-feira',
    tuesday: 'Terça-feira',
    wednesday: 'Quarta-feira',
    thursday: 'Quinta-feira',
    friday: 'Sexta-feira',
    saturday: 'Sábado',
    sunday: 'Domingo',
  };

  const handleRestaurantInfoChange = (field, value) => {
    setRestaurantInfo({ ...restaurantInfo, [field]: value });
  };

  const handleOperatingHoursChange = (day, field, value) => {
    setOperatingHours({
      ...operatingHours,
      [day]: { ...operatingHours[day], [field]: value }
    });
  };

  const handleSave = () => {
    // Here you would typically save to your backend
    alert('Configurações salvas com sucesso!');
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-600">Gerencie as informações do seu restaurante</p>
      </div>

      <div className="space-y-8">
        {/* Restaurant Information */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Informações do Restaurante</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Nome do Restaurante"
              value={restaurantInfo.name}
              onChange={(e) => handleRestaurantInfoChange('name', e.target.value)}
            />
            
            <Input
              label="Email"
              type="email"
              value={restaurantInfo.email}
              onChange={(e) => handleRestaurantInfoChange('email', e.target.value)}
            />
            
            <Input
              label="Telefone"
              value={restaurantInfo.phone}
              onChange={(e) => handleRestaurantInfoChange('phone', e.target.value)}
            />
            
            <Input
              label="CEP"
              value={restaurantInfo.zipCode}
              onChange={(e) => handleRestaurantInfoChange('zipCode', e.target.value)}
            />
            
            <Input
              label="Endereço"
              value={restaurantInfo.address}
              onChange={(e) => handleRestaurantInfoChange('address', e.target.value)}
            />
            
            <Input
              label="Cidade"
              value={restaurantInfo.city}
              onChange={(e) => handleRestaurantInfoChange('city', e.target.value)}
            />
            
            <Input
              label="Estado"
              value={restaurantInfo.state}
              onChange={(e) => handleRestaurantInfoChange('state', e.target.value)}
            />
            
            <Input
              label="Taxa de Entrega (R$)"
              type="number"
              step="0.01"
              value={restaurantInfo.deliveryFee}
              onChange={(e) => handleRestaurantInfoChange('deliveryFee', e.target.value)}
            />
            
            <Input
              label="Pedido Mínimo (R$)"
              type="number"
              step="0.01"
              value={restaurantInfo.minOrderValue}
              onChange={(e) => handleRestaurantInfoChange('minOrderValue', e.target.value)}
            />
            
            <Input
              label="Tempo de Entrega (min)"
              value={restaurantInfo.deliveryTime}
              onChange={(e) => handleRestaurantInfoChange('deliveryTime', e.target.value)}
              placeholder="Ex: 30-45"
            />
          </div>
          
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição do Restaurante
            </label>
            <textarea
              value={restaurantInfo.description}
              onChange={(e) => handleRestaurantInfoChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-background-primary focus:border-transparent"
              placeholder="Descreva seu restaurante..."
            />
          </div>
        </div>

        {/* Operating Hours */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Horário de Funcionamento</h2>
          
          <div className="space-y-4">
            {Object.entries(operatingHours).map(([day, hours]) => (
              <div key={day} className="flex items-center space-x-4">
                <div className="w-32">
                  <span className="text-sm font-medium text-gray-700">
                    {dayNames[day]}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={!hours.closed}
                    onChange={(e) => handleOperatingHoursChange(day, 'closed', !e.target.checked)}
                    className="rounded border-gray-300 text-background-primary focus:ring-background-primary"
                  />
                  <span className="text-sm text-gray-600">Aberto</span>
                </div>
                
                {!hours.closed && (
                  <>
                    <input
                      type="time"
                      value={hours.open}
                      onChange={(e) => handleOperatingHoursChange(day, 'open', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-background-primary focus:border-transparent"
                    />
                    <span className="text-gray-500">às</span>
                    <input
                      type="time"
                      value={hours.close}
                      onChange={(e) => handleOperatingHoursChange(day, 'close', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-background-primary focus:border-transparent"
                    />
                  </>
                )}
                
                {hours.closed && (
                  <span className="text-gray-500 italic">Fechado</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} size="lg">
            Salvar Configurações
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;