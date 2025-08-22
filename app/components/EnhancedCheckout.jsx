"use client";
import { useState, useEffect } from 'react';
import { 
  FiCreditCard, FiTruck, FiMapPin, FiCheck, FiChevronRight, 
  FiShield, FiClock, FiPackage, FiArrowLeft 
} from 'react-icons/fi';
import { PremiumCard, Button, GradientText } from './ui';
import Image from 'next/image';

const CheckoutProgressBar = ({ currentStep, steps }) => {
  return (
    <div className="flex items-center justify-between mb-8">
      {steps.map((step, index) => (
        <div key={index} className="flex items-center">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300 ${
            index < currentStep 
              ? 'bg-primarycolor border-primarycolor text-white' 
              : index === currentStep
              ? 'border-primarycolor text-primarycolor bg-primarycolor/10'
              : 'border-gray-300 text-gray-400'
          }`}>
            {index < currentStep ? (
              <FiCheck className="w-4 h-4" />
            ) : (
              <span className="text-sm font-medium">{index + 1}</span>
            )}
          </div>
          <span className={`ml-2 text-sm font-medium ${
            index <= currentStep ? 'text-primarycolor' : 'text-gray-400'
          }`}>
            {step}
          </span>
          {index < steps.length - 1 && (
            <div className={`w-8 h-0.5 mx-4 ${
              index < currentStep ? 'bg-primarycolor' : 'bg-gray-300'
            }`} />
          )}
        </div>
      ))}
    </div>
  );
};

const OrderSummaryCard = ({ items, subtotal, shipping, tax, total }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <PremiumCard className="p-6 sticky top-4">
      <div className="flex items-center justify-between mb-4">
        <GradientText className="text-lg font-semibold">
          Order Summary
        </GradientText>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-primarycolor hover:text-primarycolor/80 transition-colors lg:hidden"
        >
          <FiChevronRight className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
        </button>
      </div>

      <div className={`space-y-4 ${isExpanded ? 'block' : 'hidden lg:block'}`}>
        {/* Items */}
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {items.map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                <Image
                  src={item.image}
                  alt={item.name}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-primarycolor truncate">{item.name}</p>
                <p className="text-xs text-primarycolor/70">Qty: {item.quantity}</p>
              </div>
              <p className="text-sm font-semibold text-primarycolor">
                KES {(item.price * item.quantity).toLocaleString()}
              </p>
            </div>
          ))}
        </div>

        <div className="border-t border-primarycolor/20 pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-primarycolor/70">Subtotal</span>
            <span className="text-primarycolor">KES {subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-primarycolor/70">Shipping</span>
            <span className="text-primarycolor">KES {shipping.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-primarycolor/70">Tax</span>
            <span className="text-primarycolor">KES {tax.toLocaleString()}</span>
          </div>
          <div className="border-t border-primarycolor/20 pt-2">
            <div className="flex justify-between">
              <span className="font-semibold text-primarycolor">Total</span>
              <span className="font-bold text-lg text-primarycolor">KES {total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Security Badge */}
        <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
          <FiShield className="w-4 h-4 text-green-600" />
          <span className="text-xs text-green-700 font-medium">Secure SSL Encrypted Payment</span>
        </div>
      </div>
    </PremiumCard>
  );
};

const DeliveryOptionsCard = ({ options, selected, onSelect }) => {
  return (
    <PremiumCard className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <FiTruck className="w-5 h-5 text-primarycolor" />
        <GradientText className="text-lg font-semibold">
          Delivery Options
        </GradientText>
      </div>

      <div className="space-y-3">
        {options.map((option) => (
          <div
            key={option.id}
            onClick={() => onSelect(option)}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
              selected?.id === option.id
                ? 'border-primarycolor bg-primarycolor/5'
                : 'border-gray-200 hover:border-primarycolor/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full border-2 ${
                  selected?.id === option.id
                    ? 'border-primarycolor bg-primarycolor'
                    : 'border-gray-300'
                }`}>
                  {selected?.id === option.id && (
                    <div className="w-full h-full rounded-full bg-white scale-50" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-primarycolor">{option.name}</p>
                  <div className="flex items-center gap-4 text-sm text-primarycolor/70">
                    <span className="flex items-center gap-1">
                      <FiClock className="w-3 h-3" />
                      {option.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <FiPackage className="w-3 h-3" />
                      {option.description}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-primarycolor">
                  {option.price === 0 ? 'Free' : `KES ${option.price.toLocaleString()}`}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </PremiumCard>
  );
};

const PaymentMethodCard = ({ methods, selected, onSelect }) => {
  return (
    <PremiumCard className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <FiCreditCard className="w-5 h-5 text-primarycolor" />
        <GradientText className="text-lg font-semibold">
          Payment Method
        </GradientText>
      </div>

      <div className="space-y-3">
        {methods.map((method) => (
          <div
            key={method.id}
            onClick={() => onSelect(method)}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
              selected?.id === method.id
                ? 'border-primarycolor bg-primarycolor/5'
                : 'border-gray-200 hover:border-primarycolor/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full border-2 ${
                  selected?.id === method.id
                    ? 'border-primarycolor bg-primarycolor'
                    : 'border-gray-300'
                }`}>
                  {selected?.id === method.id && (
                    <div className="w-full h-full rounded-full bg-white scale-50" />
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <method.icon className="w-6 h-6 text-primarycolor" />
                  <div>
                    <p className="font-medium text-primarycolor">{method.name}</p>
                    <p className="text-sm text-primarycolor/70">{method.description}</p>
                  </div>
                </div>
              </div>
              {method.recommended && (
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                  Recommended
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </PremiumCard>
  );
};

const AddressCard = ({ address, selected, onSelect, onEdit }) => {
  return (
    <div
      onClick={() => onSelect(address)}
      className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
        selected?.id === address.id
          ? 'border-primarycolor bg-primarycolor/5'
          : 'border-gray-200 hover:border-primarycolor/50'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className={`w-4 h-4 rounded-full border-2 mt-1 ${
            selected?.id === address.id
              ? 'border-primarycolor bg-primarycolor'
              : 'border-gray-300'
          }`}>
            {selected?.id === address.id && (
              <div className="w-full h-full rounded-full bg-white scale-50" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FiMapPin className="w-4 h-4 text-primarycolor" />
              <p className="font-medium text-primarycolor">{address.label}</p>
            </div>
            <p className="text-sm text-primarycolor/80">{address.street}</p>
            <p className="text-sm text-primarycolor/80">{address.city}, {address.region}</p>
            <p className="text-sm text-primarycolor/70">{address.phone}</p>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(address);
          }}
          className="text-primarycolor/60 hover:text-primarycolor transition-colors"
        >
          Edit
        </button>
      </div>
    </div>
  );
};

export {
  CheckoutProgressBar,
  OrderSummaryCard,
  DeliveryOptionsCard,
  PaymentMethodCard,
  AddressCard
};
