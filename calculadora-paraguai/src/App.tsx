import React, { useState, useEffect, useRef } from 'react';
import { Calculator, DollarSign, TrendingUp, Info } from 'lucide-react';
import './App.css';

const MOEDAS = [
  { code: 'USD', name: 'Dólar' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'Libra' },
  { code: 'JPY', name: 'Iene' },
  { code: 'CHF', name: 'Franco Suíço' },
  { code: 'AUD', name: 'Dólar Australiano' },
  { code: 'CAD', name: 'Dólar Canadense' },
  { code: 'CNY', name: 'Yuan' },
  { code: 'INR', name: 'Rúpia' },
  { code: 'RUB', name: 'Rublo' },
];

interface ResultadoSimulacao {
  precoOriginal: number;
  valorConvertido: number;
  custoIOF: number;
  custoTaxaAdicional: number;
  custoMargemLucro: number;
  custoTotal: number;
  valorFinalBRL: number;
  percentualTotal: number;
  incluirMargem: boolean;
}

const SimuladorParaguai = () => {
  const [precoUSD, setPrecoUSD] = useState('');
  const [cotacaoUSD, setCotacaoUSD] = useState('');
  const [cambioMoedas, setCambioMoedas] = useState<{ code: string; name: string; valor: string }[]>([]);
  const carrosselRef = useRef<HTMLDivElement>(null);
  const [iof, setIof] = useState('1.1');
  const [taxaAdicional, setTaxaAdicional] = useState('8');
  const [margemLucro, setMargemLucro] = useState('0');
  const [incluirMargem, setIncluirMargem] = useState(false);
  type Modalidade = 'pix' | 'transferencia' | 'cartao';
  const [modalidadePagamento, setModalidadePagamento] = useState<Modalidade>('pix');
  
  const [resultado, setResultado] = useState<ResultadoSimulacao | null>(null);

  const iofPorModalidade: Record<Modalidade, number> = {
    pix: 1.1,
    transferencia: 1.1,
    cartao: 6.38
  };

  const calcularCompra = () => {
  if (!precoUSD || parseFloat(precoUSD) <= 0) return;

    const preco = parseFloat(precoUSD);
    const cotacao = parseFloat(cotacaoUSD);
    const iofPercent = parseFloat(iof) / 100;
    const taxaPercent = parseFloat(taxaAdicional) / 100;
    const margemPercent = incluirMargem ? parseFloat(margemLucro) / 100 : 0;

    // Fórmula: (Preço_USD × Cotação) × (1 + IOF) × (1 + Taxa_Adicional) × (1 + Margem_Lucro)
    const valorConvertido = preco * cotacao;
    const valorComIOF = valorConvertido * (1 + iofPercent);
    const valorComTaxaAdicional = valorComIOF * (1 + taxaPercent);
    const valorFinalBRL = valorComTaxaAdicional * (1 + margemPercent);

    // Cálculos auxiliares para exibição
    const custoIOF = valorConvertido * iofPercent;
    const custoTaxaAdicional = valorComIOF * taxaPercent;
    const custoMargemLucro = incluirMargem ? valorComTaxaAdicional * margemPercent : 0;
    const custoTotal = custoIOF + custoTaxaAdicional + custoMargemLucro;
    const percentualTotal = ((valorFinalBRL - valorConvertido) / valorConvertido) * 100;

    setResultado({
      precoOriginal: preco,
      valorConvertido,
      custoIOF,
      custoTaxaAdicional,
      custoMargemLucro,
      custoTotal,
      valorFinalBRL,
      percentualTotal,
      incluirMargem
    });
  };


  // Buscar cotações das moedas principais
  useEffect(() => {
    const fetchCotacoes = async () => {
      try {
  const API_KEY = process.env.REACT_APP_EXCHANGE_API_KEY;
  const BASE_URL = process.env.REACT_APP_EXCHANGE_API_BASE_URL;
        const url = `${BASE_URL}/${API_KEY}/latest/BRL`;
        const response = await fetch(url);
        const data = await response.json();
        if (data && data.conversion_rates) {
          const moedas = MOEDAS.map(m => ({
            code: m.code,
            name: m.name,
            valor: (1 / Number(data.conversion_rates[m.code])).toFixed(2)
          }));
          setCambioMoedas(moedas);
          // Atualiza cotação USD para o simulador
          const usd = moedas.find(m => m.code === 'USD');
          if (usd) setCotacaoUSD(usd.valor);
        }
      } catch (error) {
        console.error('Erro ao buscar cotações:', error);
      }
    };
    fetchCotacoes();
  }, []);

  // Rolagem automática do carrossel
  useEffect(() => {
    if (!carrosselRef.current || cambioMoedas.length === 0) return;
    let pos = 0;
    const itemWidth = 132; // largura aproximada de cada item (minWidth + margin)
    const interval = setInterval(() => {
      if (!carrosselRef.current) return;
      pos += itemWidth;
      if (pos > carrosselRef.current.scrollWidth - carrosselRef.current.clientWidth) {
        pos = 0;
      }
      carrosselRef.current.scrollTo({ left: pos, behavior: 'smooth' });
    }, 2000);
    return () => clearInterval(interval);
  }, [cambioMoedas]);

  useEffect(() => {
    setIof(iofPorModalidade[modalidadePagamento].toString());
  }, [modalidadePagamento]);

  useEffect(() => {
    if (precoUSD) {
      calcularCompra();
    }
  }, [precoUSD, cotacaoUSD, iof, taxaAdicional, margemLucro, incluirMargem]);

  return (
    <div className="simulador-container">
      {/* Carrossel de moedas */}
      <div ref={carrosselRef} className="carrossel-moedas" style={{ overflowX: 'auto', overflowY: 'hidden', whiteSpace: 'nowrap', marginBottom: 24, padding: '8px 0' }}>
        {cambioMoedas.map((m) => (
          <div key={m.code} style={{ display: 'inline-block', minWidth: 120, background: '#eef2ff', borderRadius: 8, marginRight: 12, padding: '10px 16px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ fontWeight: 600, color: '#3730a3', fontSize: '1.05rem' }}>{m.name}</div>
            <div style={{ fontSize: '0.95rem', color: '#444' }}>{m.code}</div>
            <div style={{ fontWeight: 700, color: '#166534', fontSize: '1.1rem', marginTop: 4 }}>R$ {m.valor}</div>
          </div>
        ))}
      </div>
      <div className="simulador-title">
        <Calculator style={{ marginRight: 12, color: '#3730a3' }} size={32} />
        Simulador de Compra - Paraguai
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        {/* Formulário de Input */}
        <div>
          <form className="simulador-form">
            <label className="simulador-label">Preço em USD ($)</label>
            <input
              type="number"
              value={precoUSD}
              onChange={(e) => setPrecoUSD(e.target.value)}
              placeholder="Ex: 100"
              className="simulador-input"
            />
            <label className="simulador-label">Cotação USD/BRL (R$)</label>
            <input
              type="number"
              step="0.01"
              value={cotacaoUSD}
              onChange={(e) => setCotacaoUSD(e.target.value)}
              className="simulador-input"
            />
            <label className="simulador-label">Modalidade de Pagamento</label>
            <select
              value={modalidadePagamento}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setModalidadePagamento(e.target.value as Modalidade)}
              className="simulador-select"
            >
              <option value="pix">PIX Internacional (IOF 1,1%)</option>
              <option value="transferencia">Transferência (IOF 1,1%)</option>
              <option value="cartao">Cartão Crédito/Débito (IOF 6,38%)</option>
            </select>
            <label className="simulador-label">IOF (%)</label>
            <input
              type="number"
              step="0.01"
              value={iof}
              onChange={(e) => setIof(e.target.value)}
              className="simulador-input"
            />
            <label className="simulador-label">Taxa Adicional (Spread + Serviço) (%)</label>
            <input
              type="number"
              step="0.1"
              value={taxaAdicional}
              onChange={(e) => setTaxaAdicional(e.target.value)}
              placeholder="Ex: 8"
              className="simulador-input"
            />
            <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: 16, marginTop: 16 }}>
              <input
                type="checkbox"
                id="incluirMargem"
                checked={incluirMargem}
                onChange={(e) => setIncluirMargem(e.target.checked)}
                className="simulador-checkbox"
              />
              <label htmlFor="incluirMargem" className="simulador-label" style={{ display: 'inline', fontWeight: 400 }}>
                <TrendingUp style={{ marginRight: 6, verticalAlign: 'middle' }} size={16} />
                Incluir margem de lucro (para revenda)
              </label>
              {incluirMargem && (
                <div>
                  <label className="simulador-label">Margem de Lucro (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={margemLucro}
                    onChange={(e) => setMargemLucro(e.target.value)}
                    placeholder="Ex: 20"
                    className="simulador-input"
                  />
                </div>
              )}
            </div>
          </form>
          <div style={{ background: '#eef2ff', padding: 12, borderRadius: 8, marginTop: 18 }}>
            <Info style={{ marginRight: 6, verticalAlign: 'middle', color: '#3730a3' }} size={16} />
            <span style={{ fontWeight: 500 }}>Fórmula Aplicada:</span>
            <code style={{ color: '#3730a3', fontSize: '0.95rem', display: 'block', marginTop: 4 }}>
              Valor Final = (Preço × Cotação) × (1 + IOF) × (1 + Taxa Adicional) × (1 + Margem Lucro)
            </code>
          </div>
        </div>
        {/* Resultado */}
        <div>
          {resultado && (
            <div className="simulador-result">
              <div className="simulador-result-title">Resultado da Simulação</div>
              <div>
                <div className="simulador-result-row">
                  <span>Preço Original:</span>
                  <span>${resultado.precoOriginal.toFixed(2)}</span>
                </div>
                <div className="simulador-result-row">
                  <span>Valor Convertido:</span>
                  <span>R$ {resultado.valorConvertido.toFixed(2)}</span>
                </div>
                <div className="simulador-result-row" style={{ fontSize: '0.95rem', color: '#dc2626' }}>
                  <span>+ IOF ({iof}%):</span>
                  <span>R$ {resultado.custoIOF.toFixed(2)}</span>
                </div>
                <div className="simulador-result-row" style={{ fontSize: '0.95rem', color: '#dc2626' }}>
                  <span>+ Taxa Adicional ({taxaAdicional}%):</span>
                  <span>R$ {resultado.custoTaxaAdicional.toFixed(2)}</span>
                </div>
                {resultado.incluirMargem && (
                  <div className="simulador-result-row" style={{ fontSize: '0.95rem', color: '#2563eb' }}>
                    <span>+ Margem Lucro ({margemLucro}%):</span>
                    <span>R$ {resultado.custoMargemLucro.toFixed(2)}</span>
                  </div>
                )}
                <div className="simulador-result-row" style={{ fontWeight: 500, borderTop: '2px solid #22c55e', marginTop: 16, paddingTop: 8 }}>
                  <span>Custo Total Adicional:</span>
                  <span>R$ {resultado.custoTotal.toFixed(2)}</span>
                </div>
                <div style={{ background: '#bbf7d0', borderRadius: 8, padding: '12px 18px', marginTop: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#166534' }}>
                    {resultado.incluirMargem ? 'Preço de Venda:' : 'Custo Total:'}
                  </span>
                  <span style={{ fontWeight: 700, fontSize: '1.5rem', color: '#166534' }}>
                    R$ {resultado.valorFinalBRL.toFixed(2)}
                  </span>
                </div>
                <div style={{ textAlign: 'center', marginTop: 18, background: '#fef9c3', borderRadius: 8, padding: 10 }}>
                  <strong>Acréscimo Total:</strong> {resultado.percentualTotal.toFixed(2)}% sobre o valor convertido
                </div>
              </div>
            </div>
          )}
          {!resultado && (
            <div className="simulador-result" style={{ background: '#f3f4f6', textAlign: 'center' }}>
              <Calculator style={{ margin: '0 auto 12px', color: '#a3a3a3', display: 'block' }} size={48} />
              <p style={{ color: '#6b7280' }}>
                Digite o preço em USD para ver a simulação
              </p>
            </div>
          )}
          <div className="simulador-dicas">
            <strong>💡 Dicas:</strong>
            <ul style={{ marginTop: 8 }}>
              <li>PIX tem menor IOF (1,1%) vs Cartão (6,38%)</li>
              <li>Taxa padrão de 8% considera spread cambial + taxas</li>
              <li>Marque "margem de lucro" apenas se for revender</li>
              <li>Para uso pessoal, deixe a margem desmarcada</li>
              <li>Verifique a cotação atual antes de calcular</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimuladorParaguai;