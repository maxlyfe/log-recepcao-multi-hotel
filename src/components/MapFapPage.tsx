import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { UtensilsCrossed, Plus, Search, Loader2, ChevronsUpDown, ArrowLeft, ArrowRight, Edit, Trash2, Printer } from 'lucide-react';
import { useMapFap } from '../hooks/useMapFap';
import MapFapModal from './MapFapModal';
import DailyChecklist from './DailyChecklist';
import useEmblaCarousel from 'embla-carousel-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { MapFapReservation } from '../types/mapfap';

// --- Componente de Card para Impressão ---
const PrintableReservationCard = ({ reservation }: { reservation: MapFapReservation }) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const isCheckinDay = reservation.start_date === today;
    const isCheckoutDay = reservation.end_date === today;

    const hasLunch = reservation.pension_type === 'FAP' && !isCheckinDay;
    const hasDinner = (reservation.pension_type === 'FAP' && !isCheckoutDay) || reservation.pension_type === 'MAP';

    if (!hasLunch && !hasDinner) {
        return null;
    }

    const useOptimizedFapLayout = hasLunch && hasDinner;

    return (
        <div className="card-print">
            <div className="card-print-header">
                <h3>Reserva: {reservation.reservation_number}</h3>
                <span>UH: {reservation.uh_number || 'N/A'}</span>
            </div>
            <div className="card-print-body">
                <p><strong>Pensão:</strong> {reservation.pension_type} ({ (reservation.guest_names || []).length } hóspedes)</p>
                
                {useOptimizedFapLayout ? (
                    <div className="meal-group fap-optimized">
                        <div className="fap-header">
                            <span>Hóspede</span>
                            <div className="fap-checkbox-labels">
                                <span>Almoço</span>
                                <span>Jantar</span>
                            </div>
                        </div>
                        <ul>
                            {(reservation.guest_names.length > 0 ? reservation.guest_names : ['Hóspede']).map((name, index) => (
                                <li key={index} className="fap-guest-row">
                                    <span className="guest-name-fap">{name}</span>
                                    <div className="fap-checkboxes">
                                        <span className="checkbox-print"></span>
                                        <span className="checkbox-print"></span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : (
                    <div className="meals-section">
                        {hasLunch && (
                            <div className="meal-group">
                                <h4>Almoço</h4>
                                <ul>
                                    {(reservation.guest_names.length > 0 ? reservation.guest_names : ['Hóspede']).map((name, index) => (
                                        <li key={index}>
                                            <span>{name}</span>
                                            <span className="checkbox-print"></span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {hasDinner && (
                            <div className="meal-group">
                                <h4>Jantar</h4>
                                <ul>
                                    {(reservation.guest_names.length > 0 ? reservation.guest_names : ['Hóspede']).map((name, index) => (
                                        <li key={index}>
                                            <span>{name}</span>
                                            <span className="checkbox-print"></span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Componente de Relatório ---
const PrintableCardReport = ({ reservations, selectedHotel }: { reservations: MapFapReservation[], selectedHotel: any }) => {
    const hotelName = selectedHotel?.name || "Hotel";
    
    const reservationsWithMealsToday = reservations.filter(res => {
        const today = format(new Date(), 'yyyy-MM-dd');
        const isCheckinDay = res.start_date === today;
        const isCheckoutDay = res.end_date === today;
        const hasLunch = res.pension_type === 'FAP' && !isCheckinDay;
        const hasDinner = (res.pension_type === 'FAP' && !isCheckoutDay) || res.pension_type === 'MAP';
        return hasLunch || hasDinner;
    });

    return (
        <div className="hidden print:block printable-area">
            <style type="text/css" media="print">{`
                body * {
                    visibility: hidden;
                }
                .printable-area, .printable-area * {
                    visibility: visible;
                }
                .printable-area {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                }
                @page {
                    size: A4;
                    margin: 1.5cm;
                }
                html, body {
                    background: white !important;
                }
                .report-print-header {
                    text-align: center;
                    margin-bottom: 2rem;
                }
                .report-print-header h1 {
                    font-size: 16pt;
                    font-weight: bold;
                    margin: 0;
                }
                .report-print-header p {
                    font-size: 12pt;
                    margin-top: 4px;
                }
                .card-container-print {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                }
                .card-print {
                    border: 1px solid #000;
                    padding: 0.75rem;
                    break-inside: avoid;
                    background: #fff !important;
                }
                .card-print-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid #ccc;
                    padding-bottom: 0.5rem;
                    margin-bottom: 0.5rem;
                }
                .card-print-header h3 {
                    font-size: 12pt;
                    font-weight: bold;
                    margin: 0;
                }
                .card-print-header span {
                    font-size: 10pt;
                    font-weight: bold;
                }
                .card-print-body p {
                    font-size: 10pt;
                    margin-bottom: 0.75rem;
                }
                .meals-section {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }
                .meal-group h4 {
                    font-size: 11pt;
                    font-weight: bold;
                    margin-bottom: 4px;
                }
                .meal-group ul {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                    font-size: 10pt;
                }
                .meal-group li {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 3px 0;
                    border-bottom: 1px dotted #ccc;
                }
                .meal-group li:last-child {
                    border-bottom: none;
                }
                .checkbox-print {
                    display: inline-block;
                    width: 16px;
                    height: 16px;
                    border: 1px solid #000;
                    flex-shrink: 0;
                }
                .fap-optimized ul {
                    margin-top: 8px;
                }
                .fap-header, .fap-guest-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 4px 0;
                    font-size: 10pt;
                }
                .fap-header {
                    font-weight: bold;
                    border-bottom: 1px solid #999;
                }
                .fap-guest-row {
                    border-bottom: 1px dotted #ccc;
                }
                .fap-guest-row:last-child {
                    border-bottom: none;
                }
                .guest-name-fap {
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    padding-right: 8px;
                }
                .fap-checkbox-labels, .fap-checkboxes {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    flex-shrink: 0;
                    width: 90px;
                    justify-content: space-between;
                }
                .no-reservations-message {
                    font-size: 12pt;
                    text-align: center;
                    margin-top: 3rem;
                    grid-column: 1 / -1;
                }
            `}</style>
            
            <header className="report-print-header">
                <h1>MAP/FAP - {hotelName}</h1>
                <p>{format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
            </header>

            <main>
                <div className="card-container-print">
                    {reservationsWithMealsToday.length > 0 ? (
                        reservationsWithMealsToday.map(res => (
                           <PrintableReservationCard key={`print-${res.id}`} reservation={res} />
                        ))
                    ) : (
                        <p className="no-reservations-message">Nenhuma reserva com MAP/FAP para hoje.</p>
                    )}
                </div>
            </main>
        </div>
    );
};

export default function MapFapPage() {
    const { 
      reservationsForToday, 
      activeAndFutureReservations, 
      pastReservations, 
      checklist, 
      isLoading, 
      fetchReservations,
      deleteReservation,
      selectedHotel
    } = useMapFap();
    
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingReservation, setEditingReservation] = useState<MapFapReservation | null>(null);
    const [emblaRef, emblaApi] = useEmblaCarousel({ align: 'start', dragFree: true });
    const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
    const [nextBtnDisabled, setNextBtnDisabled] = useState(true);

    // MUDANÇA AQUI: Cria a data formatada para exibição
    const displayDate = format(new Date(), "eeee, dd 'de' MMMM", { locale: ptBR });

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
    
    const handleEdit = (reservation: MapFapReservation) => {
        setEditingReservation(reservation);
        setShowModal(true);
    };

    const handleDelete = async (reservationId: string) => {
        if(window.confirm("Tem certeza que deseja excluir esta reserva?")) {
            await deleteReservation(reservationId);
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingReservation(null);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const userTimezoneOffset = date.getTimezoneOffset() * 60000;
        return format(new Date(date.getTime() + userTimezoneOffset), "dd/MM/yyyy", { locale: ptBR });
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <>
            <PrintableCardReport reservations={reservationsForToday} selectedHotel={selectedHotel} />

            <div className="space-y-8 print:hidden">
                <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-serif text-gray-900 dark:text-white flex items-center gap-3">
                        <UtensilsCrossed className="h-8 w-8 text-blue-600" />
                        Controle MAP/FAP
                    </h2>
                    <button onClick={() => { setEditingReservation(null); setShowModal(true); }} className="luxury-button px-6 py-3 bg-blue-600 text-white rounded-xl flex items-center gap-2">
                        <Plus /> Nova Reserva
                    </button>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                        type="text" 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder="Buscar por nº de reserva..." 
                        className="w-full pl-10 pr-4 py-3 luxury-input"
                    />
                </div>

                <div className="glass-effect p-6 rounded-2xl">
                    {/* MUDANÇA AQUI: Adiciona a data abaixo do título */}
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h3 className="text-xl font-medium">Checklist do Dia</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{displayDate}</p>
                        </div>
                        <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 dark:text-blue-400 dark:border-blue-400 dark:hover:bg-blue-900/20">
                           <Printer size={16} /> Imprimir Relatório
                        </button>
                    </div>
                    
                    {isLoading && reservationsForToday.length === 0 ? ( <div className="text-center p-4"><Loader2 className="animate-spin mx-auto"/></div> ) : 
                    reservationsForToday.length > 0 ? (
                        <div className="relative">
                            <div className="embla overflow-hidden -mx-6 px-6" ref={emblaRef}>
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
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold text-lg">{res.reservation_number}</p>
                                            {res.uh_number && <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">UH {res.uh_number}</span>}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button onClick={() => handleEdit(res)} className="p-1 hover:text-blue-500"><Edit size={16}/></button>
                                            <button onClick={() => handleDelete(res.id)} className="p-1 hover:text-red-500"><Trash2 size={16}/></button>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{res.pension_type} • {(res.guest_names || []).length} hóspedes</p>
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
                                            <div className="flex justify-between items-start">
                                                <p className="font-bold text-lg">{res.reservation_number}</p>
                                                {res.uh_number && <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">UH {res.uh_number}</span>}
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{res.pension_type} • {(res.guest_names || []).length} hóspedes</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </details>
                </div>

                {showModal && <MapFapModal reservation={editingReservation} onClose={closeModal} onSuccess={fetchReservations} />}
            </div>
        </>
    );
}