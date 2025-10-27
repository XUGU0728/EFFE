window.addEventListener('DOMContentLoaded', () => {
    kakao.maps.load(() => {
        const mapContainer = document.querySelector('.margielaMap');
        const map = new kakao.maps.Map(mapContainer, {
            center: new kakao.maps.LatLng(37.5342387, 127.0021508),
            level: 3
        });

        const margielaPosition = new kakao.maps.LatLng(37.5342387, 127.0021508);

        // 마커
        const margielaMarker = new kakao.maps.Marker({ position: margielaPosition, map });

        // 커스텀 오버레이
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
            position: new kakao.maps.LatLng(margielaPosition.getLat() + 0.0004, margielaPosition.getLng()),
            yAnchor: 1
        });
        overlay.setMap(map);

        // X 버튼 닫기
        setTimeout(() => {
            const closeBtn = document.querySelector('.margielaMap .customOverlay .close-btn');
            if (closeBtn) closeBtn.addEventListener('click', () => overlay.setMap(null));
        }, 300);

        kakao.maps.event.addListener(margielaMarker, 'click', () => overlay.setMap(map));

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

        // 편의점 / 주차장 마커
        const markerSrc = 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/category.png';

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

        function createCategoryMarker(pos, spriteY){
            const imageSize = new kakao.maps.Size(22,26);
            const imageOptions = { spriteOrigin: new kakao.maps.Point(10, spriteY), spriteSize: new kakao.maps.Size(36,98) };
            const markerImage = new kakao.maps.MarkerImage(markerSrc, imageSize, imageOptions);
            return new kakao.maps.Marker({ position: pos, image: markerImage });
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
        };

        // 지도 컨트롤
        map.addControl(new kakao.maps.MapTypeControl(), kakao.maps.ControlPosition.TOPLEFT);
        map.addControl(new kakao.maps.ZoomControl(), kakao.maps.ControlPosition.RIGHT);
    });
});