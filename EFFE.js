// 공통 헤더 & 푸터 불러오기
$(document).ready(function(){
    $('#header').load('header.html')
    $('#footer').load('footer.html')
})

document.addEventListener('DOMContentLoaded', () => {
    lineScroll()
    imgScroll()
    modal()
    mainEffect()
})
window.addEventListener('load', () => {
    aboutEffect()
})

//lineV 스크롤애니메이션
function lineScroll() {
    let scroll=new IntersectionObserver((item) => {
        item.forEach((el) => {
            if(el.isIntersecting) {
            el.target.classList.add('onLineV')
            }
        })
    }, {
        root : null,
        rootMargin : '0px 0px 0% 0px',
        threshold : 1
    })

    document.querySelectorAll('.lineV, .lineVW').forEach((item)=>{
        scroll.observe(item)
    })  
}

//Fimg 스크롤애니메이션
function imgScroll() {
    let scroll=new IntersectionObserver((item) => {
        item.forEach((el) => {
            if(el.isIntersecting) {
            el.target.classList.add('onF')
            }
        })
    }, {
        root : null,
        rootMargin : '0px 0px 20% 0px',
        threshold : 0.1
    })

    document.querySelectorAll('[class*="FImg"]').forEach((item)=>{
        scroll.observe(item)
    })  
}

// 메인페이지 main-page
function mainEffect() {
    //mainVideo
    let mainText=document.querySelectorAll("[class*='mainText0'],.mainTextMove")
    let mainChange=document.querySelectorAll('.mainChange')
    let mainEffe=document.querySelector('.mainEffe')

    if (!mainText.length || !mainChange.length || !mainEffe) return; 

        setTimeout(() => {
            mainText.forEach((el, idx) => {
                setTimeout(() => {
                    el.classList.add('onMove')
                }, idx * 800)
            })
        }, 2000)

        let mainTextLen = mainText[mainText.length - 1]
        let changeLen= mainChange[mainChange.length - 1]
        let changeLast = mainChange.length - 1
        mainTextLen.addEventListener('transitionend', () => {
            setTimeout(() => {
                mainChange.forEach((el) =>{
                    el.classList.remove('onChange', 'onChange2')
                })
                mainChange.forEach((el, idx) => {
                    if(idx!==changeLast){
                        setTimeout(() => {
                            el.classList.add('onChange')
                            setTimeout(() => {
                                el.classList.remove('onChange')
                                el.classList.add('onChange2')
                                idx++
                            }, 1600)
                        }, idx * 1600)
                    }else{
                        setTimeout(() => {
                            el.classList.add('onChange')
                        }, 4800)
                    }
                })
            }, 800)
        }, {once: true})

        changeLen.addEventListener('transitionend', () => {
            setTimeout(() => {
                mainText.forEach((el, idx) => {
                    setTimeout(() => {
                        el.classList.remove('onMove')
                    }, idx * 600)
                })
            }, 1800)
            
            setTimeout(() => {
                mainEffe.classList.add('onEffe')
            }, 4200)
        }, {once: true})

    //롤링이미지
    let main02=document.querySelector('.main02')
    let rollingBox=document.querySelector('.rollingBox')

    let clone=rollingBox.cloneNode(true)
    main02.appendChild(clone)

    //스크롤이벤트
    let scroll=new IntersectionObserver((item) => {
            item.forEach((el) => {
                if(el.isIntersecting) {
                el.target.classList.add('onMainBox')
                }
            })
        }, {
            root : null,
            rootMargin : '0px 0px 20% 0px',
            threshold : 0.1
        })

        document.querySelectorAll('.mainBox').forEach((item)=>{
            scroll.observe(item)
        })
}

// 에페소개페이지 effe-about-page
function aboutEffect() {
    //이미지 슬라이드
    let aboutSlides = document.querySelector('.aboutSlides');
    let slides = aboutSlides.querySelectorAll('.slide');
    let currentIndex = 1;
    let total = slides.length - 2
    let slideWidth = slides[0].clientWidth;

    aboutSlides.style.transition = 'none';
    aboutSlides.style.transform = `translateX(-${slideWidth * currentIndex}px)`;
    updateProgress();

        function updateProgress() {
        let page = currentIndex
        if (currentIndex === 0) page = total;
        if (currentIndex === slides.length - 1) page = 1

        let aboutProgress = document.querySelector('.aboutProgress');
        let pageIndex = document.querySelector('.pageIndex');
        let percent = (page / total) * 100;
        aboutProgress.style.width = `${percent}%`
        pageIndex.textContent = `0${page}`
    }

    aboutSlides.addEventListener('transitionend', () => {
        if (currentIndex === slides.length - 1) {
            aboutSlides.style.transition = 'none'
            currentIndex = 1
            aboutSlides.style.transform = `translateX(-${slideWidth * currentIndex}px)`
        } else if (currentIndex === 0) {
            aboutSlides.style.transition = 'none'
            currentIndex = slides.length - 1
            aboutSlides.style.transform = `translateX(-${slideWidth * currentIndex}px)`
        }
    });

    function moveToIndex(index) {
        currentIndex = index;
        aboutSlides.style.transition = 'transform 0.6s ease-in-out';
        aboutSlides.style.transform = `translateX(-${slideWidth * currentIndex}px)`;
        updateProgress();
    }

    function autoSlide() {
        moveToIndex(currentIndex + 1)
    }
    let timer = setInterval(autoSlide, 3000);

    document.querySelector('.nextBtn').addEventListener('click', () => {
        clearInterval(timer);
        autoSlide();
        timer = setInterval(autoSlide, 3000);
    });

    document.querySelector('.prevBtn').addEventListener('click', () => {
        clearInterval(timer);
        moveToIndex(currentIndex - 1);
        timer = setInterval(autoSlide, 3000);
    });

    //드래그 이벤트
    function dragAble(el){
        let down = false
        let px = 0, py = 0 //이전 좌표
        let tx = 0, ty = 0 //누적 이동값
        // 드래그 시작 (마우스 + 터치)
        function start(e){
            down = true
            if(e.type === "mousedown"){
                px = e.clientX
                py = e.clientY
            } else if(e.type === "touchstart"){
                px = e.touches[0].clientX
                py = e.touches[0].clientY
            }
        }

        // 드래그 중
        function move(e){
            if(!down) return
            let clientX, clientY
            if(e.type === "mousemove"){
                clientX = e.clientX
                clientY = e.clientY
            } else if(e.type === "touchmove"){
                clientX = e.touches[0].clientX
                clientY = e.touches[0].clientY
            }
            let dx = clientX - px
            let dy = clientY - py
            px = clientX
            py = clientY
            tx += dx
            ty += dy
            el.style.transform = `translate(${tx}px, ${ty}px)`
            e.preventDefault()
        }

        function end(){ down = false }

        el.addEventListener("mousedown", start)
        el.addEventListener("touchstart", start)

        window.addEventListener("mousemove", move)
        window.addEventListener("touchmove", move)

        window.addEventListener("mouseup", end)
        window.addEventListener("touchend", end)

        // 원래 자리로 복귀하는 메서드 추가
        el.resetPosition = function() {
            tx = 0
            ty = 0
            el.style.transition = 'transform 0.4s ease'
            el.style.transform = 'translate(0px, 0px)'
            setTimeout(()=>{ el.style.transition = '' }, 400)
        }
    }

    // 여러 요소 적용
    let mover = document.querySelectorAll('.mover')
    mover.forEach(e => dragAble(e))

    // 원래 자리로 버튼
    document.querySelector('.resetBtn').addEventListener('click', ()=>{
        mover.forEach(el => el.resetPosition())
    })
}

function modal() {
    let modal = document.querySelector('.modal');
    let closeBtn = document.querySelector('.modalCloseBtn');
    let img = document.querySelector('.modalImage img');
    let brand = document.querySelector('.modalBrand');
    let name = document.querySelector('.modalName');
    let descKo = document.querySelector('.modalDescKo');
    let descEn = document.querySelector('.modalDescEn');
    let styling = document.querySelector('.modalStyling');
    let modalMark = document.querySelector('.modalMark');

    fetch('./perfume.json')
        .then(response => response.json())
        .then(perfumes => {
            let randomPerfume = perfumes[Math.floor(Math.random() * perfumes.length)];

            modal.style.backgroundColor = randomPerfume.background_color;
            modal.style.color = randomPerfume.text_color;
            img.src = randomPerfume.image_url;
            brand.textContent = randomPerfume.brand;
            name.textContent = randomPerfume.name;
            descKo.textContent = randomPerfume.description_ko;
            descEn.textContent = randomPerfume.description_en;
            styling.textContent = randomPerfume.styling_keywords.join(' | ');

            img.addEventListener('click', (e) => {
                    window.location.href = randomPerfume.link;
            });
            modal.style.display = 'flex';
            setTimeout(() => {
            modal.classList.add('modalOn');
            }, 5000);

            setTimeout(() => {
                modal.classList.add('modalAfter');
            }, 10000);

            modalMark.addEventListener('click', (e) => {
                if (e.target.closest('.modalCloseBtn')) return;
                if (modal.classList.contains('modalAfter')) {
                    modal.classList.remove('modalAfter');
                    modal.classList.add('modalOn');
                }else if (modal.classList.contains('modalOn')) {
                    modal.classList.remove('modalOn');
                    modal.classList.add('modalAfter');
                }
            })
        })
        .catch(err => {
            console.error("JSON load error:", err);
        });

    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
};