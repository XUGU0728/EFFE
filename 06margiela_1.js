let map;
let margielaPosition;
let searchMarkers = [];
let routePolyline = null;
let infowindow = null;
const WORKER_URL = "https://small-bush-73af.0728csw.workers.dev/";

window.addEventListener('DOMContentLoaded', () => {
    kakao.maps.load(() => {
        const mapContainer = document.querySelector('.margielaMap');
        map = new kakao.maps.Map(mapContainer, {
            center: new kakao.maps.LatLng(37.5342387, 127.0021508),
            level: 3
        });

        margielaPosition = new kakao.maps.LatLng(37.5342387, 127.0021508);
        infowindow = new kakao.maps.InfoWindow({ zIndex: 1 });

        const markerImageSrc = './source/markerM.png';
        const markerImageSize = new kakao.maps.Size(48, 48);
        const markerImageOption = { offset: new kakao.maps.Point(24, 48) };
        const markerImage = new kakao.maps.MarkerImage(markerImageSrc, markerImageSize, markerImageOption);

        const margielaMarker = new kakao.maps.Marker({
            position: margielaPosition,
            image: markerImage,
            map: map
        });

        const overlayContent = `
            <div class="customOverlay" style="background:#393939; padding:10px; border:1px solid #aaa; border-radius:8px; box-shadow:0 2px 6px rgba(0,0,0,0.3); position:relative; display:flex; align-items:center; gap:8px;">
                <img src="./source_05MAISON_MARGIELA/logoS.jpg" alt="logo" style="width:50px;height:50px; border-radius:6px; flex-shrink:0;">
                <div style="font-size:1.4rem;">
                    <div style="position:relative; height:auto;">
                        <div style='font-weight:bold; font-size:1.6rem; color:#F7F7F7;'>MARGIELA 플래그쉽 스토어</div>
                        <div style='background-color:#F7F7F7; width:20rem; height:1px; margin:0.5rem auto;'></div>
                        <div style='margin-top:1rem auto; color:#F7F7F7;'>서울특별시 용산구 한남동 657-91</div>
                        <div class="close-btn" style="color:#F7F7F7; position:absolute; top:-5px; right:-5px; width:16px; height:16px; cursor:pointer; font-weight:bold; z-index:10;">×</div>
                    </div>
                </div>
            </div>
        `;

        const overlay = new kakao.maps.CustomOverlay({
            content: overlayContent,
            position: new kakao.maps.LatLng(margielaPosition.getLat() + 0.0005, margielaPosition.getLng()),
            yAnchor: 1
        });
        overlay.setMap(map);

        setTimeout(() => {
            const closeBtn = document.querySelector('.margielaMap .customOverlay .close-btn');
            if (closeBtn) closeBtn.addEventListener('click', () => overlay.setMap(null));
        }, 300);

        kakao.maps.event.addListener(margielaMarker, 'click', () => overlay.setMap(map));

        // 지도 컨트롤
        map.addControl(new kakao.maps.MapTypeControl(), kakao.maps.ControlPosition.TOPLEFT);
        map.addControl(new kakao.maps.ZoomControl(), kakao.maps.ControlPosition.RIGHT);

        // 교통/자전거 오버레이
        const mapTypes = { traffic: kakao.maps.MapTypeId.TRAFFIC, bicycle: kakao.maps.MapTypeId.BICYCLE };
        const activeOverlays = {};
        document.querySelectorAll('.mapTypeBox button[data-type]').forEach(btn => {
            btn.addEventListener('click', () => {
                const type = btn.dataset.type;
                if (activeOverlays[type]) {
                    map.removeOverlayMapTypeId(mapTypes[type]);
                    activeOverlays[type] = false;
                } else {
                    map.addOverlayMapTypeId(mapTypes[type]);
                    activeOverlays[type] = true;
                }
            });
        });

        // 편의점 / 주차장 마커
        const storePositions = [
            new kakao.maps.LatLng(37.5338530, 127.0036482),
            new kakao.maps.LatLng(37.5338039, 127.0042579),
            new kakao.maps.LatLng(37.5332939, 127.0041861)
        ];
        const carparkPositions = [
            new kakao.maps.LatLng(37.5337502, 127.0021482),
            new kakao.maps.LatLng(37.5348777, 127.0003081),
            new kakao.maps.LatLng(37.5333302, 127.0038881)
        ];

        function createAnimatedMarker(pos, imgSrc) {
            const markerDiv = document.createElement('div');
            markerDiv.className = 'animated-marker';
            markerDiv.innerHTML = `<img src="${imgSrc}" alt="marker">`;
            const overlay = new kakao.maps.CustomOverlay({ position: pos, content: markerDiv, yAnchor: 1 });
            overlay.setMap(map);
            return overlay;
        }

        const storeMarkers = storePositions.map(pos => createAnimatedMarker(pos, './source/store.png'));
        const carparkMarkers = carparkPositions.map(pos => createAnimatedMarker(pos, './source/parking.png'));

        let storeVisible = false;
        let carparkVisible = false;
        window.changeMarker = function(type) {
            if(type === 'store') {
                storeVisible = !storeVisible;
                storeMarkers.forEach(m => m.setMap(storeVisible ? map : null));
            } else if(type === 'carpark') {
                carparkVisible = !carparkVisible;
                carparkMarkers.forEach(m => m.setMap(carparkVisible ? map : null));
            }
        };
        storeMarkers.forEach(m => m.setMap(null));
        carparkMarkers.forEach(m => m.setMap(null));

        // 검색 기능
        const ps = new kakao.maps.services.Places();
        document.getElementById('searchBtn').addEventListener('click', () => {
            const keyword = document.getElementById('keyword').value.trim();
            if(!keyword) { alert('검색어를 입력하세요!'); return; }
            ps.keywordSearch(keyword, placesSearchCB);
        });
    });
});

// 검색 콜백 + 길찾기
function placesSearchCB(data, status){
    if(status !== kakao.maps.services.Status.OK){ alert('검색 결과가 없습니다.'); return; }

    searchMarkers.forEach(m => m.setMap(null));
    searchMarkers = [];

    const bounds = new kakao.maps.LatLngBounds();
    data.forEach(place => {
        const marker = new kakao.maps.Marker({
            position: new kakao.maps.LatLng(place.y, place.x),
            map: map
        });
        kakao.maps.event.addListener(marker, 'click', () => {
            infowindow.setContent(`<div style="padding:5px;font-size:13px;">${place.place_name}</div>`);
            infowindow.open(map, marker);
        });
        searchMarkers.push(marker);
        bounds.extend(marker.getPosition());
    });
    map.setBounds(bounds);

    // 길찾기 호출
    const origin = `${data[0].x},${data[0].y}`;
    const destination = `${margielaPosition.getLng()},${margielaPosition.getLat()}`;

    fetch(`${WORKER_URL}?origin=${origin}&destination=${destination}`)
        .then(res => res.json())
        .then(routeData => drawRouteOnMap(routeData))
        .catch(err => console.error("길찾기 오류:", err));
}

// 경로 표시 + 총 거리/소요시간
function drawRouteOnMap(routeData){
    if(routePolyline) routePolyline.setMap(null);

    const coords = [];
    const roads = routeData.routes[0].sections[0].roads;
    roads.forEach(road => {
        const verts = road.vertexes;
        for(let i=0; i<verts.length; i+=2){
            coords.push(new kakao.maps.LatLng(verts[i+1], verts[i]));
        }
    });

    routePolyline = new kakao.maps.Polyline({
        path: coords,
        strokeWeight: 5,
        strokeColor: '#8000FF',
        strokeOpacity: 0.8,
        strokeStyle: 'solid'
    });
    routePolyline.setMap(map);

    const bounds = new kakao.maps.LatLngBounds();
    coords.forEach(latlng => bounds.extend(latlng));
    map.setBounds(bounds);

    // 총 거리 및 소요 시간 표시
    const totalDistance = routeData.routes[0].summary.distance;
    const totalDuration = routeData.routes[0].summary.duration;

    const distanceKm = (totalDistance / 1000).toFixed(1);
    const durationMin = Math.ceil(totalDuration / 60);

    const infoDiv = document.querySelector('.routeInfo');
    if(infoDiv){
        infoDiv.innerHTML = `
            <svg width="24" height="24" viewBox="0 2 24 24" fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                style="vertical-align: middle; margin-right: 0.3rem;">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M2 14.803v6.447c0 .414.336.75.75.75h1.614a.75.75 0 0 0 .74-.627L5.5 19h13l.395 2.373a.75.75 0 0 0 .74.627h1.615a.75.75 0 0 0 .75-.75v-6.447a5.954 5.954 0 0 0-1-3.303l-.78-1.17a1.994 1.994 0 0 1-.178-.33h.994a.75.75 0 0 0 .671-.415l.25-.5A.75.75 0 0 0 21.287 8H19.6l-.31-1.546a2.5 2.5 0 0 0-1.885-1.944C15.943 4.17 14.141 4 12 4c-2.142 0-3.943.17-5.405.51a2.5 2.5 0 0 0-1.886 1.944L4.399 8H2.714a.75.75 0 0 0-.67 1.085l.25.5a.75.75 0 0 0 .67.415h.995a1.999 1.999 0 0 1-.178.33L3 11.5c-.652.978-1 2.127-1 3.303zm15.961-4.799a4 4 0 0 0 .34.997H5.699c.157-.315.271-.65.34-.997l.632-3.157a.5.5 0 0 1 .377-.39C8.346 6.157 10 6 12 6c2 0 3.654.156 4.952.458a.5.5 0 0 1 .378.389l.631 3.157zM5.5 16a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM20 14.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" fill="#f7f7f7"/>
            </svg>
            총 거리: ${distanceKm}km · 예상 소요시간: ${durationMin}분
        `;
}
}
