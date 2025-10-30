let map;
let tomPosition;
let searchMarkers = [];
let routePolyline = null;
let infowindow = null;
const WORKER_URL = "https://small-bush-73af.0728csw.workers.dev/";

window.addEventListener('DOMContentLoaded', () => {
    kakao.maps.load(() => {
        const mapContainer = document.querySelector('.tomMap');
        map = new kakao.maps.Map(mapContainer, {
            center: new kakao.maps.LatLng(37.5284458, 127.0401040),
            level: 3
        });

        tomPosition = new kakao.maps.LatLng(37.5284458, 127.0401040);
        infowindow = new kakao.maps.InfoWindow({ zIndex: 1 });

        const markerImageSrc = './source/MarkerT.png';
        const markerImageSize = new kakao.maps.Size(48, 48);
        const markerImageOption = { offset: new kakao.maps.Point(24, 48) };
        const markerImage = new kakao.maps.MarkerImage(markerImageSrc, markerImageSize, markerImageOption);

        const tomMarker = new kakao.maps.Marker({
            position: tomPosition,
            image: markerImage,
            map: map
        });

        const overlayContent = `
            <div class="customOverlay" style="background:#603E3E; padding:10px; border:1px solid #aaa; border-radius:8px; box-shadow:0 2px 6px rgba(0,0,0,0.3); position:relative; display:flex; align-items:center; gap:8px;">
                <img src="./source_02TOM_FORD/logoS.jpg" alt="logo" style="width:50px;height:50px; border-radius:6px; flex-shrink:0;">
                <div style="font-size:1.4rem;">
                    <div style="position:relative; height:auto;">
                        <div style='font-weight:bold; font-size:1.6rem; color:#F7F7F7'>TOM FORD 매장</div>
                        <div style='background-color:#F7F7F7; width:20rem; height:1px; margin:0.5rem auto;'></div>
                        <div style='margin-top:1rem auto; color:#F7F7F7'>강남구 압구정로 343 갤러리아백화점</div>
                        <div class="close-btn" style="color:#F7F7F7; position:absolute; top:-5px; right:-5px; width:16px; height:16px; cursor:pointer; font-weight:bold; z-index:10;">×</div>
                    </div>
                </div>
            </div>
        `;

        const overlay = new kakao.maps.CustomOverlay({
            content: overlayContent,
            position: new kakao.maps.LatLng(tomPosition.getLat() + 0.0005, tomPosition.getLng()),
            yAnchor: 1
        });
        overlay.setMap(map);

        document.querySelector('.tomMap .customOverlay .close-btn')
            .addEventListener('click', () => overlay.setMap(null));

        kakao.maps.event.addListener(tomMarker, 'click', () => overlay.setMap(map));

        // 지도 컨트롤
        const mapTypeControl = new kakao.maps.MapTypeControl();
        map.addControl(mapTypeControl, kakao.maps.ControlPosition.TOPLEFT);
        const zoomControl = new kakao.maps.ZoomControl();
        map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);

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
            new kakao.maps.LatLng(37.5273635, 127.0405768),
            new kakao.maps.LatLng(37.5277111, 127.0398715),
            new kakao.maps.LatLng(37.5272101, 127.0407618)
        ];
        const carparkPositions = [
            new kakao.maps.LatLng(37.5272188, 127.0402271),
            new kakao.maps.LatLng(37.5281863, 127.0380787),
            new kakao.maps.LatLng(37.5272221, 127.0392215)
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
    const destination = `${tomPosition.getLng()},${tomPosition.getLat()}`;

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
        strokeColor: '#FF0000',
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
        infoDiv.innerText = `총 거리: ${distanceKm}km · 예상 소요시간: ${durationMin}분`;
    }
}
