import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const urlIconeISS = 'https://upload.wikimedia.org/wikipedia/commons/d/d0/International_Space_Station.svg';

function Mapa() {
    const [latitudeISS, setLatitudeISS] = useState(0);
    const [longitudeISS, setLongitudeISS] = useState(0);
    const referenciaMapa = useRef(null);
    const referenciaMarcadorISS = useRef(null);

    useEffect(() => {
        if (!referenciaMapa.current) {
            referenciaMapa.current = L.map('mapa').setView([0, 0], 3);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(referenciaMapa.current);

            const iconeISS = L.icon({
                iconUrl: urlIconeISS,
                iconSize: [45, 45],
                iconAnchor: [22, 45],
                popupAnchor: [0, -45]
            });

            referenciaMarcadorISS.current = L.marker([latitudeISS, longitudeISS], { icon: iconeISS }).addTo(referenciaMapa.current);
        }

        function atualizarPosicaoISS() {
            fetch('http://api.open-notify.org/iss-now.json')
                .then(resposta => resposta.json())
                .then(dados => {
                    const { latitude, longitude } = dados.iss_position;
                    setLatitudeISS(latitude);
                    setLongitudeISS(longitude);

                    if (referenciaMarcadorISS.current) {
                        referenciaMarcadorISS.current.setLatLng([latitude, longitude]);
                    }

                    if (referenciaMapa.current) {
                        referenciaMapa.current.setView([latitude, longitude], referenciaMapa.current.getZoom(), { animate: true });
                    }
                })
                .catch(erro => {
                    console.error("Erro ao buscar dados da ISS:", erro);
                });
        }

        const intervaloAtualizacao = setInterval(atualizarPosicaoISS, 5000);
        atualizarPosicaoISS();

        return () => {
            clearInterval(intervaloAtualizacao);
            if (referenciaMapa.current) {
                referenciaMapa.current.remove();
                referenciaMapa.current = null;
            }
        };
    }, []);

    return (
        <div id="mapa" style={{ height: '600px', width: '100%' }}></div>
    );
}

function App() {
    return (
        <div>
            <Mapa />
        </div>
    );
}

export default App;