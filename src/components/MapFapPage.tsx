import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { UtensilsCrossed, Plus, Search, Loader2, ChevronsUpDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { useMapFap } from '../hooks/useMapFap';
import MapFapModal from './MapFapModal';
import DailyChecklist from './DailyChecklist';
import useEmblaCarousel from 'embla-carousel-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function MapFapPage() {
    const { 
      reservationsForToday, 
      activeAndFutureReservations, 
      pastReservations, 
      checklist, 
      isLoading, 
      fetchReservations 
    } = useMapFap();
    
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [emblaRef, emblaApi] = useEmblaCarousel({ align: 'start', dragFree: true });
    const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
    const [nextBtnDisabled, setNextBtnDisabled] = useState(true);

    const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
    const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setPrevBtnDisabled(!emblaApi.canScrollPrev());
        setNextBtnDisabled(!emblaApi.canScrollNext());
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;
        onSelect();
        emblaApi.on('select', onSelect);
        emblaApi.on('reInit', onSelect);
    }, [emblaApi, onSelect]);

    const filteredActiveAndFuture = useMemo(() => {
        if (!searchTerm) return activeAndFutureReservations;
        return activeAndFutureReservations.filter(res => 
            res.reservation_number.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [activeAndFutureReservations, searchTerm]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const userTimezoneOffset = date.getTimezoneOffset() * 60000;
        return format(new Date(date.getTime() + userTimezoneOffset), "dd/MM/yyyy", { locale: ptBR });
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-serif text-gray-900 dark:text-white flex items-center gap-3">
                    <UtensilsCrossed className="h-8 w-8 text-blue-600" />
                    Controle MAP/FAP
                </h2>
                <button onClick={() => setShowModal(true)} className="luxury-button px-6 py-3 bg-blue-600 text-white rounded-xl flex items-center gap-2">
                    <Plus /> Nova Reserva
                </button>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Buscar por nº de reserva..." className="w-full pl-10 pr-4 py-3 luxury-input"/>
            </div>

            <div className="glass-effect p-6 rounded-2xl">
                <h3 className="text-xl font-medium mb-4">Checklist do Dia</h3>
                {isLoading ? ( <div className="text-center p-4"><Loader2 className="animate-spin mx-auto"/></div> ) : 
                  reservationsForToday.length > 0 ? (
                    <div className="relative">
                        <div className="embla overflow-hidden" ref={emblaRef}>
                            <div className="embla__container flex space-x-4 pb-4">
                                <DailyChecklist reservations={reservationsForToday} checklist={checklist} />
                            </div>
                        </div>
                        <button className="embla__button absolute top-1/2 -translate-y-1/2 -left-4" onClick={scrollPrev} disabled={prevBtnDisabled}>
                            <ArrowLeft size={20} />
                        </button>
                        <button className="embla__button absolute top-1/2 -translate-y-1/2 -right-4" onClick={scrollNext} disabled={nextBtnDisabled}>
                            <ArrowRight size={20} />
                        </button>
                    </div>
                  ) : ( <p className="text-center text-gray-500 py-4">Nenhuma reserva com MAP/FAP para hoje.</p> )
                }
            </div>
            
            <div className="glass-effect p-6 rounded-2xl">
                <h3 className="text-xl font-medium mb-4">Reservas Ativas e Futuras</h3>
                {isLoading && activeAndFutureReservations.length === 0 ? ( <div className="text-center p-4"><Loader2 className="animate-spin mx-auto"/></div> ) : (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredActiveAndFuture.map(res => (
                            <div key={res.id} className="p-4 bg-white/50 dark:bg-gray-800/30 rounded-lg shadow">
                                <p className="font-bold text-lg">{res.reservation_number}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{res.pension_type} • {res.guest_count} hóspedes</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Período: {formatDate(res.start_date)} a {formatDate(res.end_date)}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            <div className="glass-effect rounded-2xl">
                <details className="group">
                    <summary className="flex justify-between items-center p-6 cursor-pointer list-none">
                        <h3 className="text-xl font-medium">Histórico de Check-outs</h3>
                        <ChevronsUpDown className="h-5 w-5 text-gray-500 group-open:rotate-180 transition-transform" />
                    </summary>
                    <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                        {isLoading ? ( <div className="text-center p-4"><Loader2 className="animate-spin mx-auto"/></div> ) : (
                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {pastReservations.map(res => (
                                    <div key={res.id} className="p-4 bg-white/50 dark:bg-gray-800/30 rounded-lg shadow opacity-70">
                                        <p className="font-bold text-lg">{res.reservation_number}</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">{res.pension_type} • {res.guest_count} hóspedes</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </details>
            </div>

            {showModal && <MapFapModal onClose={() => setShowModal(false)} onSuccess={fetchReservations} />}
        </div>
    );
}