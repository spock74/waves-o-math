import React, { useState } from 'react';
import FourierCanvas, { WaveType } from './components/FourierCanvas';
import DecompositionView from './components/DecompositionView';
import GeneralizationView from './components/GeneralizationView';

const App: React.FC = () => {
  const [order, setOrder] = useState<number>(1);
  const [waveType, setWaveType] = useState<WaveType>('square');
  const [speed, setSpeed] = useState<number>(1);
  const [viewMode, setViewMode] = useState<'epicycles' | 'decomposition' | 'generalization'>('epicycles');

  // Fix: Use React.ReactNode instead of JSX.Element to resolve "Cannot find namespace 'JSX'" error.
  const formulas: { [key in WaveType]?: React.ReactNode } = {
    square: (
      <p className="whitespace-nowrap">
        <span className="font-serif">f</span>
        <sub className="font-serif">N</sub>
        (<span className="font-serif">t</span>) = <sup>4</sup>&frasl;<sub>&pi;</sub> &sum; <sub><span className="font-serif">k</span>=0</sub><sup><span className="font-serif">N</span>-1</sup> (<sup>1</sup>&frasl;<sub>2<span className="font-serif">k</span>+1</sub>) sin((2<span className="font-serif">k</span>+1)<span className="font-serif">t</span>)
      </p>
    ),
    sawtooth: (
      <p className="whitespace-nowrap">
        <span className="font-serif">f</span>
        <sub className="font-serif">N</sub>
        (<span className="font-serif">t</span>) = <sup>2</sup>&frasl;<sub>&pi;</sub> &sum; <sub><span className="font-serif">k</span>=1</sub><sup><span className="font-serif">N</span></sup> (<sup>(-1)<sup><span className="font-serif">k</span>+1</sup></sup>&frasl;<sub><span className="font-serif">k</span></sub>) sin(<span className="font-serif">k</span><span className="font-serif">t</span>)
      </p>
    ),
    triangular: (
        <p className="whitespace-nowrap">
            <span className="font-serif">f</span>
            <sub className="font-serif">N</sub>
            (<span className="font-serif">t</span>) = <sup>8</sup>&frasl;<sub>&pi;<sup>2</sup></sub> &sum; <sub><span className="font-serif">k</span>=0</sub><sup><span className="font-serif">N</span>-1</sup> (<sup>(-1)<sup><span className="font-serif">k</span></sup></sup>&frasl;<sub>(2<span className="font-serif">k</span>+1)<sup>2</sup></sub>) sin((2<span className="font-serif">k</span>+1)<span className="font-serif">t</span>)
        </p>
    ),
    gaussian: (
        <p className="whitespace-nowrap">
            <span className="font-serif">f</span>
            (<span className="font-serif">t</span>) = <span className="font-serif">e</span><sup>-<span className="font-serif">t</span>²</sup>
        </p>
    )
  };

  const generalizationFormula = (
    <div className="flex flex-col items-center">
        <p className="whitespace-nowrap">
            Função: <span className="font-serif">f</span>(<span className="font-serif">t</span>) = <span className="font-serif">t</span>², para <span className="font-serif">t</span> ∈ [-π, π]
        </p>
        <p className="whitespace-nowrap mt-1">
            <span className="font-serif">f</span>(<span className="font-serif">t</span>) = <sup>&pi;²</sup>&frasl;<sub>3</sub> + &sum; <sub><span className="font-serif">n</span>=1</sub><sup>&infin;</sup> [<sup>4(-1)<sup><span className="font-serif">n</span></sup></sup>&frasl;<sub><span className="font-serif">n</span>²</sub>] cos(<span className="font-serif">n</span><span className="font-serif">t</span>)
        </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center justify-center p-4 font-sans">
      <main className="w-full max-w-7xl mx-auto flex flex-col items-center">
        <header className="text-center mb-6">
          <h1 className="text-5xl md:text-6xl text-amber-200" style={{ fontFamily: "'Baskervville', serif" }}>
            Séries de Fourier
          </h1>
          <p className="text-lg text-gray-400 mt-2">
            {viewMode === 'generalization'
              ? 'Generalização das Séries de Fourier para intervalos de funções aperiódicas'
              : 'Visualizando funções com epiciclos.'}
          </p>
        </header>

        <div className="w-full mb-4">
            <div className="flex justify-center p-1 bg-gray-800 rounded-lg">
                <button 
                    onClick={() => setViewMode('epicycles')}
                    className={`px-6 py-2 rounded-md transition-colors duration-200 text-lg font-medium ${viewMode === 'epicycles' ? 'bg-amber-300 text-gray-900' : 'text-gray-400 hover:bg-gray-700'}`}
                    aria-pressed={viewMode === 'epicycles'}
                >
                    Epiciclos
                </button>
                <button 
                    onClick={() => setViewMode('decomposition')}
                    className={`px-6 py-2 rounded-md transition-colors duration-200 text-lg font-medium ${viewMode === 'decomposition' ? 'bg-amber-300 text-gray-900' : 'text-gray-400 hover:bg-gray-700'}`}
                    aria-pressed={viewMode === 'decomposition'}
                >
                    Decomposição
                </button>
                 <button 
                    onClick={() => setViewMode('generalization')}
                    className={`px-6 py-2 rounded-md transition-colors duration-200 text-lg font-medium ${viewMode === 'generalization' ? 'bg-amber-300 text-gray-900' : 'text-gray-400 hover:bg-gray-700'}`}
                    aria-pressed={viewMode === 'generalization'}
                >
                    Generalização
                </button>
            </div>
        </div>

        <div className="text-center mb-4 text-gray-400 italic text-lg select-none min-h-[56px] flex flex-col justify-center">
          {viewMode === 'generalization' ? generalizationFormula : formulas[waveType]}
        </div>

        <div className="w-full bg-gray-800/50 backdrop-blur-sm rounded-lg shadow-2xl border border-gray-700 overflow-hidden">
          {viewMode === 'epicycles' && (
            <FourierCanvas order={order} waveType={waveType} speed={speed} key={`epicycles-${order}-${waveType}`} />
          )}
          {viewMode === 'decomposition' && (
            <DecompositionView order={order} waveType={waveType} speed={speed} key={`decomposition-${order}-${waveType}`} />
          )}
          {viewMode === 'generalization' && (
            <GeneralizationView order={order} speed={speed} key={`generalization-${order}`} />
          )}
        </div>

        <div className="w-full max-w-3xl mt-8 p-6 bg-gray-800/50 backdrop-blur-sm rounded-lg shadow-xl border border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 items-start">
            <div className="space-y-8">
              <div>
                <div className="flex justify-between items-center mb-2">
                    <label htmlFor="order-slider" className="text-xl text-amber-200">
                        Número de Termos (N)
                    </label>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setOrder(o => Math.max(1, o - 1))}
                            disabled={order <= 1}
                            className="w-8 h-8 rounded-full bg-gray-700 text-lg font-bold flex items-center justify-center hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Diminuir número de termos"
                        >
                            -
                        </button>
                        <span className="font-bold text-2xl text-white tabular-nums w-10 text-center">{order}</span>
                        <button
                            onClick={() => setOrder(o => Math.min(30, o + 1))}
                            disabled={order >= 30}
                            className="w-8 h-8 rounded-full bg-gray-700 text-lg font-bold flex items-center justify-center hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Aumentar número de termos"
                        >
                            +
                        </button>
                    </div>
                </div>
                <input
                  id="order-slider"
                  type="range"
                  min="1"
                  max="30"
                  step="1"
                  value={order}
                  onChange={(e) => setOrder(parseInt(e.target.value, 10))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  aria-label="Número de termos da série de Fourier"
                />
                 <div className="flex justify-between text-xs text-gray-400 mt-2 px-1">
                    <span>1</span>
                    <span>5</span>
                    <span>10</span>
                    <span>15</span>
                    <span>20</span>
                    <span>25</span>
                    <span>30</span>
                </div>
              </div>
              <div>
                <label htmlFor="speed-slider" className="text-xl mb-3 text-amber-200 block">
                  Velocidade da Animação: <span className="font-bold text-2xl text-white tabular-nums">{speed.toFixed(1)}x</span>
                </label>
                <input
                  id="speed-slider"
                  type="range"
                  min="0.1"
                  max="5"
                  step="0.1"
                  value={speed}
                  onChange={(e) => setSpeed(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  aria-label="Velocidade da animação"
                />
              </div>
            </div>
             <div className={viewMode === 'generalization' ? 'invisible' : ''}>
                <label htmlFor="wave-type-select" className="text-xl mb-3 text-amber-200 block">
                    Tipo de Onda
                </label>
                <select 
                    id="wave-type-select"
                    value={waveType}
                    onChange={(e) => setWaveType(e.target.value as WaveType)}
                    className="w-full p-2.5 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-amber-300"
                    aria-label="Selecione o tipo de onda"
                >
                    <option value="square">Quadrada</option>
                    <option value="sawtooth">Dente de Serra</option>
                    <option value="triangular">Triangular</option>
                    <option value="gaussian">Gaussiana</option>
                </select>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;