window.addEventListener('DOMContentLoaded', () => {
    kakao.maps.load(() => {
        const mapContainer = document.querySelector('.burberryMap');
        const map = new kakao.maps.Map(mapContainer, {
            center: new kakao.maps.LatLng(37.5244860, 127.0467938),
            level: 3
        });

        const burberryPosition = new kakao.maps.LatLng(37.5244860, 127.0467938);

        // 마커
        const burberryMarker = new kakao.maps.Marker({ position: burberryPosition, map });

        // 커스텀 오버레이
        const overlayContent = `
            <div class="customOverlay" style="background:#E2D4C1; padding:10px; border:1px solid #aaa; border-radius:8px; box-shadow:0 2px 6px rgba(0,0,0,0.3); position:relative; display:flex; align-items:center; gap:8px;">
                <img src="./source_04BURBERRY/logoS.jpg" alt="logo" style="width:50px;height:50px; border-radius:6px; flex-shrink:0;">
                <div style="font-size:1.4rem;">
                    <div style="position:relative; height:auto;">
                        <div style='font-weight:bold; font-size:1.6rem;'>BURBERRY 플래그쉽 스토어</div>
                        <div style='background-color:#222; width:20rem; height:1px; margin:0.5rem auto;'></div>
                        <div style='margin-top:1rem auto;'>서울특별시 강남구 도산대로 459</div>
                        <div class="close-btn" style="position:absolute; top:-5px; right:-5px; width:16px; height:16px; cursor:pointer; font-weight:bold; z-index:10;">×</div>
                    </div>
                </div>
            </div>
        `;

        const overlay = new kakao.maps.CustomOverlay({
            content: overlayContent,
            position: new kakao.maps.LatLng(burberryPosition.getLat() + 0.0004, burberryPosition.getLng()),
            yAnchor: 1
        });
        overlay.setMap(map);

        // X 버튼 클릭 시 오버레이 제거
        const closeOverlayBtn = document.querySelector('.burberryMap .customOverlay .close-btn');
        closeOverlayBtn.addEventListener('click', () => overlay.setMap(null));

        // 마커 클릭 시 오버레이 다시 표시
        kakao.maps.event.addListener(burberryMarker, 'click', () => overlay.setMap(map));

        
        // 교통/자전거 오버레이
        const mapTypes = {
            traffic : kakao.maps.MapTypeId.TRAFFIC,
            bicycle : kakao.maps.MapTypeId.BICYCLE
        };
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

        // 검색 기능
        const ps = new kakao.maps.services.Places();
        const infowindow = new kakao.maps.InfoWindow({ zIndex: 1 });
        let searchMarkers = [];

        document.getElementById('searchBtn').addEventListener('click', () => {
            const keyword = document.getElementById('keyword').value.trim();
            if(!keyword) { alert('검색어를 입력하세요!'); return; }
            ps.keywordSearch(keyword, placesSearchCB);
        });

        function placesSearchCB(data, status){
            if(status === kakao.maps.services.Status.OK){
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
            } else {
                alert('검색 결과가 없습니다.');
            }
        }

        // 지도 컨트롤
        const mapTypeControl = new kakao.maps.MapTypeControl();
        map.addControl(mapTypeControl, kakao.maps.ControlPosition.TOPLEFT);
        const zoomControl = new kakao.maps.ZoomControl();
        map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);

        window.currentTypeId = null;
        window.setOverlayMapTypeId = function(type){
            let overlayType;
            if(type === 'traffic') overlayType = kakao.maps.MapTypeId.TRAFFIC;
            else if(type === 'bicycle') overlayType = kakao.maps.MapTypeId.BICYCLE;

            if(window.currentTypeId) map.removeOverlayMapTypeId(window.currentTypeId);
            map.addOverlayMapTypeId(overlayType);
            window.currentTypeId = overlayType;

            overlay.setMap(map);
        }

        // 편의점 / 주차장 마커
        const markerSrc = 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/category.png';

        const storePositions = [
            new kakao.maps.LatLng(37.5236996, 127.0460695),
            new kakao.maps.LatLng(37.5235958, 127.0450810),
            new kakao.maps.LatLng(37.5232223, 127.0449509)
        ];
        const carparkPositions = [
            new kakao.maps.LatLng(37.5244691, 127.0463783),
            new kakao.maps.LatLng(37.5243617, 127.0457471),
            new kakao.maps.LatLng(37.5240568, 127.0489202)
        ];

        function createCategoryMarker(pos, spriteY){
            const imageSize = new kakao.maps.Size(22,26);
            const imageOptions = { spriteOrigin: new kakao.maps.Point(10, spriteY), spriteSize: new kakao.maps.Size(36,98) };
            const markerImage = new kakao.maps.MarkerImage(markerSrc, imageSize, imageOptions);
            return new kakao.maps.Marker({ position: pos, image: markerImage, map: null });
        }

        const storeMarkers = storePositions.map(pos => createCategoryMarker(pos, 36));
        const carparkMarkers = carparkPositions.map(pos => createCategoryMarker(pos, 72));

        window.changeMarker = function(type){
            if(type === 'store'){
                storeMarkers.forEach(m => m.setMap(map));
                carparkMarkers.forEach(m => m.setMap(null));
            } else if(type === 'carpark'){
                carparkMarkers.forEach(m => m.setMap(map));
                storeMarkers.forEach(m => m.setMap(null));
            }
        }
    });
});