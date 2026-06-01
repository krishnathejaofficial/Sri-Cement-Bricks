import { useState } from 'react';
import Image from 'next/image';

export default function ProductCard({ product, onOrder }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'white',
        borderRadius: '20px',
        overflow: 'hidden',
        border: `2px solid ${hovered ? '#c2410c' : '#f3f4f6'}`,
        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        transform: hovered ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
        boxShadow: hovered ? '0 24px 60px rgba(194,65,12,0.2)' : '0 4px 20px rgba(0,0,0,0.06)',
        cursor: 'pointer',
        position: 'relative',
      }}
    >
      {/* Featured badge */}
      {product.isFeatured && (
        <div style={{
          position: 'absolute', top: 16, left: 16, zIndex: 2,
          background: 'linear-gradient(135deg, #c2410c, #ea580c)',
          color: 'white', padding: '4px 12px', borderRadius: '20px',
          fontSize: '0.7rem', fontWeight: 700, letterSpacing: '1px',
          textTransform: 'uppercase',
        }}>
          ⭐ Featured
        </div>
      )}

      {/* Image */}
      <div style={{
        height: 220,
        background: 'linear-gradient(135deg, #fef3e2, #fff7ed)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden', position: 'relative',
      }}>
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            style={{
              width: '100%', height: '100%', objectFit: 'cover',
              transition: 'transform 0.5s ease',
              transform: hovered ? 'scale(1.1)' : 'scale(1)',
            }}
          />
        ) : (
          <div style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: '12px',
          }}>
            <div style={{ fontSize: '4rem' }}>🧱</div>
            <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Product Image</span>
          </div>
        )}
        {/* Overlay on hover */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(28,10,0,0.6) 0%, transparent 60%)',
          opacity: hovered ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }} />
      </div>

      {/* Content */}
      <div style={{ padding: '20px' }}>
        <div style={{
          fontSize: '0.75rem', color: '#c2410c',
          fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '1px', marginBottom: '6px',
        }}>
          {product.category}
        </div>

        <h3 style={{
          fontFamily: 'Playfair Display, serif',
          fontSize: '1.25rem', fontWeight: 700,
          color: '#1c0a00', marginBottom: '8px',
        }}>
          {product.name}
        </h3>

        <p style={{
          color: '#6b7280', fontSize: '0.875rem',
          lineHeight: 1.5, marginBottom: '16px',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {product.description || 'High-quality cement brick for all construction needs.'}
        </p>

        {/* Specs */}
        {product.specifications && Object.keys(product.specifications).length > 0 && (
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px',
          }}>
            {Object.entries(product.specifications).slice(0, 3).map(([k, v]) => (
              <span key={k} style={{
                background: '#fef3e2', color: '#78350f',
                padding: '3px 10px', borderRadius: '12px',
                fontSize: '0.75rem', fontWeight: 500,
              }}>
                {k}: {v}
              </span>
            ))}
          </div>
        )}

        {/* Price */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', marginTop: '8px',
        }}>
          <div>
            <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>Price per {product.unit || 'piece'}</div>
            <div style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: '1.6rem', fontWeight: 700, color: '#c2410c',
            }}>
              ₹{product.pricePerUnit}
            </div>
          </div>
          <button
            onClick={() => onOrder(product)}
            style={{
              background: hovered
                ? 'linear-gradient(135deg, #c2410c, #ea580c)'
                : 'linear-gradient(135deg, #fef3e2, #fff7ed)',
              color: hovered ? 'white' : '#c2410c',
              border: `2px solid #c2410c`,
              padding: '10px 20px', borderRadius: '10px',
              fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem',
              transition: 'all 0.3s ease', fontFamily: 'DM Sans, sans-serif',
            }}
          >
            Order Now →
          </button>
        </div>

        <div style={{ marginTop: '10px', color: '#9ca3af', fontSize: '0.75rem' }}>
          Min order: {product.minOrderQty || 100} {product.unit || 'pieces'}
        </div>
      </div>
    </div>
  );
}
