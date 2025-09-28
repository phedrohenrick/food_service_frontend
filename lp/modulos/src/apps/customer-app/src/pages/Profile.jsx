import React, { useState } from 'react';
import { Button, Input } from '../../../../shared/components/ui';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);

  const [userInfo, setUserInfo] = useState({
    name: 'João Silva',
    email: 'joao.silva@email.com',
    phone: '(11) 99999-9999',
    birthDate: '1990-05-15',
    cpf: '123.456.789-00',
  });

  const [addresses, setAddresses] = useState([
    {
      id: 1,
      label: 'Casa',
      street: 'Rua das Flores, 123',
      neighborhood: 'Centro',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234-567',
      isDefault: true,
    },
    {
      id: 2,
      label: 'Trabalho',
      street: 'Av. Paulista, 1000',
      neighborhood: 'Bela Vista',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01310-100',
      isDefault: false,
    },
  ]);

  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: 1,
      type: 'credit',
      brand: 'Visa',
      lastFour: '1234',
      isDefault: true,
    },
    {
      id: 2,
      type: 'debit',
      brand: 'Mastercard',
      lastFour: '5678',
      isDefault: false,
    },
  ]);

  const handleSaveProfile = () => {
    // Here you would typically save to your backend
    setIsEditing(false);
    alert('Perfil atualizado com sucesso!');
  };

  const handleDeleteAddress = (id) => {
    setAddresses(addresses.filter(addr => addr.id !== id));
  };

  const handleDeletePaymentMethod = (id) => {
    setPaymentMethods(paymentMethods.filter(pm => pm.id !== id));
  };

  const getPaymentIcon = (type, brand) => {
    if (type === 'credit') return '💳';
    if (type === 'debit') return '💳';
    if (type === 'pix') return '📱';
    return '💰';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Meu Perfil</h1>
        <p className="text-gray-600">Gerencie suas informações pessoais e preferências</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'profile', label: 'Dados Pessoais' },
            { key: 'addresses', label: 'Endereços' },
            { key: 'payments', label: 'Pagamento' },
            { key: 'preferences', label: 'Preferências' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.key
                  ? 'border-background-primary text-background-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium text-gray-900">Informações Pessoais</h2>
            <Button
              variant="outline"
              onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
            >
              {isEditing ? 'Salvar' : 'Editar'}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Nome Completo"
              value={userInfo.name}
              onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
              disabled={!isEditing}
            />
            
            <Input
              label="Email"
              type="email"
              value={userInfo.email}
              onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
              disabled={!isEditing}
            />
            
            <Input
              label="Telefone"
              value={userInfo.phone}
              onChange={(e) => setUserInfo({ ...userInfo, phone: e.target.value })}
              disabled={!isEditing}
            />
            
            <Input
              label="Data de Nascimento"
              type="date"
              value={userInfo.birthDate}
              onChange={(e) => setUserInfo({ ...userInfo, birthDate: e.target.value })}
              disabled={!isEditing}
            />
            
            <Input
              label="CPF"
              value={userInfo.cpf}
              onChange={(e) => setUserInfo({ ...userInfo, cpf: e.target.value })}
              disabled={!isEditing}
            />
          </div>
        </div>
      )}

      {/* Addresses Tab */}
      {activeTab === 'addresses' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Meus Endereços</h2>
            <Button>Adicionar Endereço</Button>
          </div>

          {addresses.map((address) => (
            <div key={address.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-medium text-gray-900">{address.label}</h3>
                    {address.isDefault && (
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        Padrão
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 mb-1">{address.street}</p>
                  <p className="text-gray-600">
                    {address.neighborhood}, {address.city} - {address.state}
                  </p>
                  <p className="text-gray-600">CEP: {address.zipCode}</p>
                </div>
                
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteAddress(address.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Excluir
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Payment Methods Tab */}
      {activeTab === 'payments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Métodos de Pagamento</h2>
            <Button>Adicionar Cartão</Button>
          </div>

          {paymentMethods.map((method) => (
            <div key={method.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-2xl">
                    {getPaymentIcon(method.type, method.brand)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium text-gray-900">
                        {method.brand} •••• {method.lastFour}
                      </h3>
                      {method.isDefault && (
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                          Padrão
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 capitalize">
                      Cartão de {method.type === 'credit' ? 'crédito' : 'débito'}
                    </p>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeletePaymentMethod(method.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Remover
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preferences Tab */}
      {activeTab === 'preferences' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Preferências</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-medium text-gray-900 mb-4">Notificações</h3>
              <div className="space-y-3">
                {[
                  { key: 'orderUpdates', label: 'Atualizações de pedidos' },
                  { key: 'promotions', label: 'Promoções e ofertas' },
                  { key: 'newRestaurants', label: 'Novos restaurantes' },
                  { key: 'newsletter', label: 'Newsletter semanal' },
                ].map((pref) => (
                  <div key={pref.key} className="flex items-center justify-between">
                    <span className="text-gray-700">{pref.label}</span>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="rounded border-gray-300 text-background-primary focus:ring-background-primary"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-base font-medium text-gray-900 mb-4">Privacidade</h3>
              <div className="space-y-3">
                {[
                  { key: 'shareData', label: 'Compartilhar dados para melhorar recomendações' },
                  { key: 'locationTracking', label: 'Permitir rastreamento de localização' },
                ].map((pref) => (
                  <div key={pref.key} className="flex items-center justify-between">
                    <span className="text-gray-700">{pref.label}</span>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="rounded border-gray-300 text-background-primary focus:ring-background-primary"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <Button>Salvar Preferências</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;