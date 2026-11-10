/*! Cyber Sansa i18n — zh-CN, zh-TW, en, ko, ja, es, pt-BR */
(() => {
  // v3: default zh-CN; ignore v2/legacy sticky; never navigator / Accept-Language.
  const STORAGE_KEY = "cyber-sansa-lang-v3";
  const LEGACY_STORAGE_KEYS = ["cyber-sansa-lang-v2", "cyber-sansa-lang"];
  const SUPPORTED = ["ko", "zh-CN", "zh-TW", "en", "ja", "es", "pt-BR"];
  const LANGUAGE_NAMES_ZH = ["韩语", "简体中文", "繁体中文", "英语", "日语", "西班牙语", "葡萄牙语（巴西）"];

  // The original game bundle still emits some Korean UI strings at runtime.
  const GAME_COPY_ZH = new Map(Object.entries({
    "산사": "赛博山寺",
    "청연당과 연등 산책길, 연꽃 연못, 달빛 마당이 있는 산사. 동자승 뒤에서 둘러보는 3인칭 공간":
      "赛博山寺内有清缘堂、莲灯步道、莲池和月光庭院。以第三人称视角跟随小沙弥探索。",
    "기본 소리": "主声音",
    "환경음": "环境音",
    "환경음 크기": "环境音音量",
    "바람과 새소리": "风声与鸟鸣",
    "바람 소리": "风声",
    "효과음": "音效",
    "효과음 크기": "音效音量",
    "내 종소리와 염주 소리": "自己的钟声与念珠声",
    "켜짐": "已开启",
    "꺼짐": "已关闭",
    "백그라운드 재생": "后台播放",
    "다른 탭에서도 선택한 소리가 이어져요.": "切换标签页后，选中的声音会继续播放。",
    "다른 탭으로 가면 모든 소리가 함께 멈춰요.": "切换标签页后，所有声音都会暂停。",
    "다른 탭에서는 잠시 쉬고 있어요": "切到其他标签页时已暂停",
    "선택한 소리가 나에게만 들려요": "选中的声音仅自己可听",
    "기본 소리가 꺼져 있어요": "主声音已关闭",
    "소리 버튼을 다시 눌러주세요": "请再次点击声音按钮",
    "소리를 켜고 편안히 머물러요": "可打开声音，静坐片刻",
    "소리가 종료됐어요.": "声音已结束。",
    "소리가 멈춰 있어요.": "声音已暂停。",
    "소리를 시작하지 못했어요. 소리 버튼을 다시 눌러주세요.": "未能播放声音，请再次点击声音按钮。",
    "소리가 중단됐어요. 소리 버튼을 다시 눌러주세요.": "声音播放中断，请再次点击声音按钮。",
    "소리를 시작하지 못했어요.": "未能播放声音。",
    "소리 버튼을 다시 눌러주세요.": "请再次点击声音按钮。",
    "이 브라우저는 Web Audio를 지원하지 않습니다.": "当前浏览器不支持音频播放。",
    "이용조건": "使用许可",
    "가공 내역": "音频处理说明",
    "사찰 현장 녹음 · 반야심경 완독 음원 미선정 ·": "寺院现场录音 · 《般若心经》完整诵读音源待选 ·",
    "염불소리1 · 김용배 · 공유마당 · CC BY 4.0": "念佛声 1 · Kim Yong-bae · 韩国共享资源平台 · CC BY 4.0",
    "불상 자료 ·": "佛像资料 ·",
    "국립중앙박물관, 금동불좌상·금동보살입상(덕수2116)": "韩国国立中央博物馆，鎏金铜佛坐像与鎏金铜菩萨立像（德寿 2116）",
    "공공누리 제1유형. 원본 3D 스캔 중 좌불만 분리하고 웹용 크기·텍스처·압축을 조정했습니다.":
      "韩国公共著作物开放许可第 1 类。仅从原始 3D 扫描中提取佛坐像，并调整尺寸、纹理和压缩以适用于网页。",
    "달빛 마당 음악": "月光庭院音乐",
    "달빛 마당": "月光庭院",
    "청연당": "清缘堂",
    "음악 끄기": "关闭音乐",
    "음악 켜기": "打开音乐",
    "춤추기": "跳舞",
    "춤 멈추기": "停止跳舞",
    "🎵 空 — Beyond the Self.mp3": "🎵 空 — 超越自我",
    "금강경 — 손을 펴는 자리.mp3": "金刚经 — 摊开双手",
    "법화경 관세음보살보문품 — 〈목소리가 닿는 곳〉.mp3": "法华经·观世音菩萨普门品 — 声音所及之处",
    "천수경 — 천 개의 손끝.mp3": "千手经 — 千只手的指尖",
    "확인 중": "查询中",
    "접속 인원을 확인하고 있어요": "正在查询在线人数",
    "표시된 인원은 실제 방문객 수예요.": "显示的是各房间的实际访客人数。",
    "연결을 준비하고 있어요. 잠시 후 다시 확인해주세요.": "正在准备连接，请稍后刷新。",
    "인원을 확인하지 못했어요. 잠시 후 다시 눌러주세요.": "未能查询在线人数，请稍后刷新。",
    "다른 청연당으로 연결하고 있어요": "正在连接其他清缘堂服务器",
    "이동하지 못했어요. 인원을 새로 확인한 뒤 다른 서버를 골라주세요.": "切换失败，请刷新人数后选择其他服务器。",
    "합장 인사 · 3": "合掌问候 · 3",
    "합장 인사": "合掌问候",
    "절을 마치고 합장 인사": "礼佛结束后合掌问候",
    "합장 인사 중": "正在合掌问候",
    "인사 대기": "等待问候",
    "합장 중": "合掌中",
    "합장으로 인사했어요": "已合掌问候",
    "방석으로 가는 중": "正在走向蒲团",
    "걷는 중": "行走中",
    "멈추는 중": "正在停止",
    "멈추기": "停止礼佛",
    "절하기": "礼佛",
    "둘러보며 기다리거나 멈출 수 있어요": "可环顾四周，也可停止礼佛",
    "입장 대기 중 · 염주는 바로 쓸 수 있어요": "正在等待入场 · 可先拨念珠",
    "바닥 클릭 · 드래그로 둘러보기 · 휠로 확대/축소": "点击地面移动 · 拖动环顾 · 滚轮缩放",
    "가까운 빈 바닥을 눌러주세요": "请点击附近的空地",
    "절을 마치고 합장해요": "礼佛结束后再合掌问候",
    "빈 방석을 찾지 못했어요. 둘러보다 다시 눌러주세요.": "暂未找到空蒲团，请稍后再试。",
    "염주 돌리기": "转念珠",
    "앞뒤로 이어지는 큰 나무 염주. 위아래로 쓸거나 화살표 키와 휠로 돌려 보세요.":
      "一串木质念珠。上下拖动，或使用方向键、滚轮拨动念珠。",
    "염주를 열지 못했어요. 새로고침한 뒤 다시 열어주세요.": "未能打开念珠，请刷新页面后重试。",
    "염주를 열지 못했어요. 법당을 준비하고 있어요.": "暂时无法打开念珠，法堂正在准备中。",
    "법당 준비 화면으로 돌아가기": "返回法堂准备画面",
    "잠깐 쉬고 있어요": "画面已暂停",
    "이 탭에서 이어하기": "在此继续",
    "산사 · 山寺": "赛博山寺",
    "편안히 쉬어 가셨나요": "愿你在这里歇得安心",
    "소리와 연결을 모두 마쳤어요.": "已停止声音并断开连接。",
    "다시 쉬고 싶을 때 들러주세요.": "想歇一歇时，欢迎再来。",
    "다시 머무르기": "重新进入",
    "고요한 산새": "静山雀",
    "느긋한 솔잎": "闲松",
    "따스한 물결": "暖波",
    "은은한 바람": "轻风",
    "오늘은 잠시, 속세": "且歇尘心",
  }));

  const dict = {
    "zh-CN": {
      meta: {
        title: "赛博山寺 · Cyber Sansa",
        description: "在线 3D 山寺。与同堂访客合掌、礼佛、拨念珠。",
        ogTitle: "赛博山寺 · Cyber Sansa",
        ogDescription: "在线 3D 山寺 · 合掌、礼佛、念珠",
        appleTitle: "赛博山寺",
        siteName: "赛博山寺",
      },
      brand: { short: "赛博山寺", full: "赛博山寺 / Cyber Sansa" },
      boot: {
        title: "赛博山寺",
        message: "正在开启赛博法堂…",
        retry: "重新进入",
        aria: "赛博山寺",
        noscript:
          "转念珠、礼佛、歇脚的线上寺庙。请开启浏览器的 JavaScript 以进入法堂。",
      },
      loading: {
        title: "赛博山寺",
        opening: "正在开启法堂…",
        slow: "法堂准备稍慢，请再等片刻",
        errorTitle: "未能载入风景",
        errorMessage: "请检查网络后重新进入",
        retry: "重新进入",
        beadsFirst: "先转念珠",
      },
      nav: {
        tools: "赛博山寺工具",
        exit: "离开赛博山寺",
        people: "查看访客",
        soundOn: "打开声音",
        soundOff: "关闭声音",
        settings: "设置",
        support: "上香",
        supportTitle: "点一炷虚拟香",
        hello: "合掌问候",
        bow: "礼佛",
        beads: "转念珠",
        stop: "停止移动",
        room: "选择房间",
      },
      settings: {
        title: "设置",
        close: "关闭设置",
        soundTitle: "我听到的声音",
        soundHint: "三种声音，随心调节",
        masterAria: "主声音",
        helpSummary: "操作说明",
        desktopHelp:
          "点击地面 · WASD · 方向键移动<br>拖拽环视 · 滚轮缩放<br>1 · E · 空格 礼佛/停止 · 2 念珠 · 3 合掌<br>月光庭院可跳舞代替礼佛。<br>合掌可向同在的人问好。",
        touchHelp:
          "点地面走到那里。<br>单指滑动环视，双指捏合缩放。<br>点礼佛持续拜，点停止站起。<br>月光庭院可跳舞代替礼佛。<br>捏住念珠上下拨动。<br>合掌可向同在的人问好。",
      },
      people: {
        title: "同在的人",
        close: "关闭访客窗口",
        note: "列表只计真实连线；多开标签会占多个座位。<br>点小沙弥可短暂显示名字；底部合掌可问好。",
        retry: "重新进入",
        me: "我",
        residentsTitle: "常驻小沙弥（氛围角色，非访客）",
      },
      incense: {
        title: "赛博香火钱",
        close: "关闭香火钱窗口",
        description: "赛博香火 · 随喜供养<br>以加密货币添一炷香，功德无量 🕯️",
        custom: "自定义金额 (USD / USDT)",
        customPh: "例如 10",
        name: "香客名号（可选）",
        namePh: "匿名香客",
        pay: "点燃赛博香火 · 加密支付",
        bmcDivider: "或用加密货币香火（NOWPayments）",
        bmcAlt: "Buy Me a Coffee 收款二维码（maynorai）",
        bmcPay: "Buy Me a Coffee · 打开收款页",
        footnote: "支付由 Buy Me a Coffee 与 NOWPayments 处理。香火仅供赛博山寺法堂。最低加密 $10。",
        selected: "已选 {label}（约 ${usd}）",
        minAmount: "请填写至少 $10 的香火金额（加密支付最低额）",
        creating: "正在生成加密支付账单…",
        createFail: "无法创建账单 ({status})",
        redirect: "已在新窗口打开支付，法堂保持开启…",
        popupBlocked: "浏览器拦截了支付窗口，请点下方链接在新标签打开",
        openPay: "在新窗口打开 NOWPayments",
        cancelled: "已取消支付，山门常开",
        missingUrl: "账单已创建但缺少支付链接",
        network: "网络错误，请稍后再试",
        anon: "匿名香客",
        floated: "🕯️ {name} 随喜 ${amount}",
        toast: "🙏 香火已至，功德无量",
        toastNamed: "🙏 施主{name}，香火已至，功德无量",
        toastAnon: "🙏 香火已至，功德无量（匿名随喜）",
        ceremonyTitle: "香火已至",
        ceremonyNamed: "施主{name}，香火已至。愿你心安，功德无量。",
        ceremonyAnon: "匿名香客随喜已至。愿你心安，功德无量。",
      },
      success: {
        title: "香火已至 · 赛博山寺",
        heading: "🕯️ 香火已至",
        body: "感谢随喜赛博香火钱。愿你心安。",
        back: "返回赛博法堂",
        closeHint: "可关闭本窗口，返回赛博法堂标签页。",
      },
      cancel: {
        title: "已取消 · 赛博山寺",
        heading: "已取消支付",
        body: "无妨，山门常开。随时可再来随喜。",
        back: "返回赛博法堂",
        closeHint: "可关闭本窗口，返回赛博法堂标签页。",
      },
      beads: {
        back: "返回",
        backAriaReady: "返回法堂",
        backAriaLoading: "返回法堂准备画面",
        title: "念珠",
        titleAria: "转念珠",
        soundOn: "打开声音",
        soundOff: "关闭声音",
        counterAria: "已拨念珠",
        round: "第 {n} 圈",
        roundFirst: "第 1 圈",
        counterDetail: "本圈 {current} 颗，共 {total} 颗",
        roundDone: "已转完 {n} 圈",
        gesture: "按住上下拨动",
      },
      chrome: {
        remoteGreeting: "{name} 合掌向你问好",
        hintTouch: "点击地面移动 · 滑动环顾 · 双指缩放",
        helloShort: "合掌",
        bowShort: "礼佛",
        beadsShort: "念珠",
        stopShort: "停止",
        hintDrag: "拖动画面环视四周",
        traveling: "行走中",
        listenChant: "听诵经",
        stopChant: "停止诵经",
        listenJointChant: "听共同礼佛",
        muteJointChant: "关闭礼佛声",
        bannerListening: "同听中",
        bannerListen: "一起听",
        chantTitle: "诵经",
        chantPersonalBtn: "聆听",
        chantPersonalStop: "暂停",
        chantPersonalAria: "个人诵经",
        chantPersonalAriaStop: "停止个人诵经",
        chantJointBtn: "一起听",
        chantJointMute: "关闭声音",
        chantJointAria: "共同礼佛",
        chantJointAriaStop: "关闭共同礼佛声",
        chantStatusIntro: "仅自己可听的个人聆听",
        chantStatusError: "未能载入诵经，请再试",
        chantStatusLoading: "正在载入诵经…",
        chantStatusJointListening: "正在同听 {label}",
        chantStatusPersonalPlaying: "仅自己可听的诵经",
        chantStatusUnmuteContinue: "打开声音即可继续听",
        chantStatusRest: "稍作休息后再为你播放",
        chantStatusVolumeZero: "诵经音量为 0",
        chantStatusIdle: "想听时只为自己播放",
        chantStatusBackground: "已在后台暂时暂停",
        chantStatusJointTime: "共同礼佛时间 · 打开声音即可同听",
        chantVolumeAria: "诵经音量",
        chantRule: "每日 05:00 · 18:00（韩国时间）<br>共同礼佛开始后，个人聆听会结束并转为同听。",
        chantCredit: "音源信息",
        chantNextFrom: "{label} · {time} 起",
        chantNextUpcoming: "下次 {label} {time}",
        chantJointLabel: "共同礼佛",
        modes: "法堂里可做的事",
      },
      room: {
        active: "当前",
        full: "已满",
        hall: "清缘堂",
        hallServer: "清缘堂服务器",
        hallServerN: "清缘堂服务器 {n}",
        hallServerCurrent: "当前 · 清缘堂服务器 {n}",
        hallServerList: "清缘堂服务器列表",
        hallServerPick: "选择清缘堂服务器",
        hallServerPickN: "清缘堂服务器 {n}。选择服务器",
        title: "清缘堂服务器",
        close: "关闭服务器选择",
        description: "任意服务器都能进入同一座法堂。",
        finding: "正在寻找可进入的服务器",
        refresh: "刷新人数",
        enterHall: "进入清缘堂",
        leaveGarden: "去往庭院",
        enterMoon: "进入月光庭院",
        garden: "散步庭院",
        moon: "月光庭院",
        dawnCeremony: "清晨礼佛",
        eveningCeremony: "晚间礼佛",
      },
      conn: {
        delay: "连接延迟中，正在重新连接。",
        connecting: "正在连接清缘堂…",
        connectingOther: "正在连接其他清缘堂…",
        full: "此服务器已满，请选择其他服务器。",
        fullToast: "此服务器已满。可在服务器选择中进入其他房间。",
        peopleConnecting: "连接中。查看访客",
        peopleTogether: "{n}人同在。查看访客",
        peopleFull: "{n}人。可选择其他服务器。查看访客",
        pickServer: "选择服务器",
      },

      lang: { label: "语言", name: "简体中文" },
    },
    "zh-TW": {
      meta: {
        title: "賽博山寺 / Cyber Sansa — 線上香火廟",
        description: "線上 3D 山寺。與同堂訪客合掌、禮佛、撥念珠。",
        ogTitle: "賽博山寺 · Cyber Sansa",
        ogDescription: "線上 3D 山寺 · 合掌、禮佛、念珠",
        appleTitle: "賽博山寺",
        siteName: "賽博山寺",
      },
      brand: { short: "賽博山寺", full: "賽博山寺 / Cyber Sansa" },
      boot: {
        title: "賽博山寺",
        message: "正在開啟賽博法堂…",
        retry: "重新進入",
        aria: "賽博山寺",
        noscript:
          "轉念珠、禮佛、歇腳的線上寺廟。請開啟瀏覽器的 JavaScript 以進入法堂。",
      },
      loading: {
        title: "賽博山寺",
        opening: "正在開啟法堂…",
        slow: "法堂準備稍慢，請再稍候",
        errorTitle: "無法載入風景",
        errorMessage: "請檢查連線後重新進入",
        retry: "重新進入",
        beadsFirst: "先轉念珠",
      },
      nav: {
        tools: "賽博山寺工具",
        exit: "離開賽博山寺",
        people: "查看訪客",
        soundOn: "開啟聲音",
        soundOff: "關閉聲音",
        settings: "設定",
        support: "上香",
        supportTitle: "點一炷虛擬香",
        hello: "合掌問候",
        bow: "禮佛",
        beads: "轉念珠",
        stop: "停止移動",
        room: "選擇房間",
      },
      settings: {
        title: "設定",
        close: "關閉設定",
        soundTitle: "我聽到的聲音",
        soundHint: "三種聲音，隨心調節",
        masterAria: "主聲音",
        helpSummary: "操作說明",
        desktopHelp:
          "點擊地面 · WASD · 方向鍵移動<br>拖曳環視 · 滾輪縮放<br>1 · E · 空白鍵 禮佛/停止 · 2 念珠 · 3 合掌<br>月光庭院可跳舞代替禮佛。<br>合掌可向同在的人問好。",
        touchHelp:
          "點地面走到那裡。<br>單指滑動環視，雙指捏合縮放。<br>點禮佛持續拜，點停止站起。<br>月光庭院可跳舞代替禮佛。<br>捏住念珠上下撥動。<br>合掌可向同在的人問好。",
      },
      people: {
        title: "同在的人",
        close: "關閉訪客視窗",
        note: "列表只計真實連線；多開分頁會佔多個座位。<br>點小沙彌可短暫顯示名字；底部合掌可問好。",
        retry: "重新進入",
        me: "我",
        residentsTitle: "常駐小沙彌（氛圍角色，非訪客）",
      },
      incense: {
        title: "賽博香火錢",
        close: "關閉香火錢視窗",
        description: "賽博香火 · 隨喜供養<br>以加密貨幣添一炷香，功德無量 🕯️",
        custom: "自訂金額 (USD / USDT)",
        customPh: "例如 10",
        name: "香客名號（選填）",
        namePh: "匿名香客",
        pay: "點燃賽博香火 · 加密支付",
        bmcDivider: "或用加密貨幣香火（NOWPayments）",
        bmcAlt: "Buy Me a Coffee 收款 QR（maynorai）",
        bmcPay: "Buy Me a Coffee · 開啟收款頁",
        footnote: "支付由 Buy Me a Coffee 與 NOWPayments 處理。香火僅供賽博山寺法堂。最低加密 $10。",
        selected: "已選 {label}（約 ${usd}）",
        minAmount: "請填寫至少 $10 的香火金額（加密支付最低額）",
        creating: "正在產生加密支付帳單…",
        createFail: "無法建立帳單 ({status})",
        redirect: "已在新視窗開啟支付，法堂保持開啟…",
        popupBlocked: "瀏覽器攔截了支付視窗，請點下方連結在新分頁開啟",
        openPay: "在新視窗開啟 NOWPayments",
        cancelled: "已取消支付，山門常開",
        missingUrl: "帳單已建立但缺少支付連結",
        network: "網路錯誤，請稍後再試",
        anon: "匿名香客",
        floated: "🕯️ {name} 隨喜 ${amount}",
        toast: "🙏 香火已至，功德無量",
        toastNamed: "🙏 施主{name}，香火已至，功德無量",
        toastAnon: "🙏 香火已至，功德無量（匿名隨喜）",
        ceremonyTitle: "香火已至",
        ceremonyNamed: "施主{name}，香火已至。願你心安，功德無量。",
        ceremonyAnon: "匿名香客隨喜已至。願你心安，功德無量。",
      },
      success: {
        title: "香火已至 · 賽博山寺",
        heading: "🕯️ 香火已至",
        body: "感謝隨喜賽博香火錢。願你心安。",
        back: "返回賽博法堂",
        closeHint: "可關閉本視窗，返回賽博法堂分頁。",
      },
      cancel: {
        title: "已取消 · 賽博山寺",
        heading: "已取消支付",
        body: "無妨，山門常開。隨時可再來隨喜。",
        back: "返回賽博法堂",
        closeHint: "可關閉本視窗，返回賽博法堂分頁。",
      },
      beads: {
        back: "返回",
        backAriaReady: "返回法堂",
        backAriaLoading: "返回法堂準備畫面",
        title: "念珠",
        titleAria: "轉念珠",
        soundOn: "開啟聲音",
        soundOff: "關閉聲音",
        counterAria: "已撥念珠",
        round: "第 {n} 圈",
        roundFirst: "第 1 圈",
        counterDetail: "本圈 {current} 顆，共 {total} 顆",
        roundDone: "已轉完 {n} 圈",
        gesture: "按住上下撥動",
      },
      chrome: {
        remoteGreeting: "{name} 合掌向你問好",
        hintTouch: "點擊地面移動 · 滑動環顧 · 雙指縮放",
        helloShort: "合掌",
        bowShort: "禮佛",
        beadsShort: "念珠",
        stopShort: "停止",
        hintDrag: "拖曳畫面環視四周",
        traveling: "行走中",
        listenChant: "聽誦經",
        stopChant: "停止誦經",
        listenJointChant: "聽共同禮佛",
        muteJointChant: "關閉禮佛聲",
        bannerListening: "同聽中",
        bannerListen: "一起聽",
        chantTitle: "誦經",
        chantPersonalBtn: "聆聽",
        chantPersonalStop: "暫停",
        chantPersonalAria: "個人誦經",
        chantPersonalAriaStop: "停止個人誦經",
        chantJointBtn: "一起聽",
        chantJointMute: "關閉聲音",
        chantJointAria: "共同禮佛",
        chantJointAriaStop: "關閉共同禮佛聲",
        chantStatusIntro: "僅自己可聽的個人聆聽",
        chantStatusError: "無法載入誦經，請再試",
        chantStatusLoading: "正在載入誦經…",
        chantStatusJointListening: "正在同聽 {label}",
        chantStatusPersonalPlaying: "僅自己可聽的誦經",
        chantStatusUnmuteContinue: "開啟聲音即可繼續聽",
        chantStatusRest: "稍作休息後再為你播放",
        chantStatusVolumeZero: "誦經音量為 0",
        chantStatusIdle: "想聽時只為自己播放",
        chantStatusBackground: "已在背景暫時暫停",
        chantStatusJointTime: "共同禮佛時間 · 開啟聲音即可同聽",
        chantVolumeAria: "誦經音量",
        chantRule: "每日 05:00 · 18:00（韓國時間）<br>共同禮佛開始後，個人聆聽會結束並轉為同聽。",
        chantCredit: "音源資訊",
        chantNextFrom: "{label} · {time} 起",
        chantNextUpcoming: "下次 {label} {time}",
        chantJointLabel: "共同禮佛",
        modes: "法堂裡可做的事",
      },
      room: {
        active: "目前",
        full: "已滿",
        hall: "清緣堂",
        hallServer: "清緣堂伺服器",
        hallServerN: "清緣堂伺服器 {n}",
        hallServerCurrent: "目前 · 清緣堂伺服器 {n}",
        hallServerList: "清緣堂伺服器列表",
        hallServerPick: "選擇清緣堂伺服器",
        hallServerPickN: "清緣堂伺服器 {n}。選擇伺服器",
        title: "清緣堂伺服器",
        close: "關閉伺服器選擇",
        description: "任一伺服器都能進入同一座法堂。",
        finding: "正在尋找可進入的伺服器",
        refresh: "重新整理人數",
        enterHall: "進入清緣堂",
        leaveGarden: "前往庭院",
        enterMoon: "進入月光庭院",
        garden: "散步庭院",
        moon: "月光庭院",
        dawnCeremony: "清晨禮佛",
        eveningCeremony: "晚間禮佛",
      },
      conn: {
        delay: "連線延遲中，正在重新連線。",
        connecting: "正在連線清緣堂…",
        connectingOther: "正在連線其他清緣堂…",
        full: "此伺服器已滿，請選擇其他伺服器。",
        fullToast: "此伺服器已滿。可在伺服器選擇中進入其他房間。",
        peopleConnecting: "連線中。查看訪客",
        peopleTogether: "{n}人同在。查看訪客",
        peopleFull: "{n}人。可選擇其他伺服器。查看訪客",
        pickServer: "選擇伺服器",
      },

      lang: { label: "語言", name: "繁體中文" },
    },
    en: {
      meta: {
        title: "Cyber Sansa — Online Temple & Incense",
        description:
          "Cyber Sansa · an online 3D temple. Offer cyber incense with crypto.",
        ogTitle: "Cyber Sansa",
        ogDescription: "Online 3D temple · cyber incense offerings",
        appleTitle: "Cyber Sansa",
        siteName: "Cyber Sansa",
      },
      brand: { short: "Cyber Sansa", full: "Cyber Sansa" },
      boot: {
        title: "Cyber Sansa",
        message: "Opening the cyber temple hall…",
        retry: "Enter again",
        aria: "Cyber Sansa",
        noscript:
          "A place to turn beads, bow, and rest. Please enable JavaScript to enter the hall.",
      },
      loading: {
        title: "Cyber Sansa",
        opening: "Opening the temple hall…",
        slow: "The hall is taking a little longer…",
        errorTitle: "Couldn’t load the landscape",
        errorMessage: "Check your connection and enter again",
        retry: "Enter again",
        beadsFirst: "Turn beads first",
      },
      nav: {
        tools: "Temple tools",
        exit: "Leave Cyber Sansa",
        people: "Visitors",
        soundOn: "Unmute",
        soundOff: "Mute",
        settings: "Settings",
        support: "Cyber incense",
        supportTitle: "Offer cyber incense",
        hello: "Greeting (hapjang)",
        bow: "Bow",
        beads: "Turn prayer beads",
        stop: "Stop walking",
        room: "Choose a room",
      },
      settings: {
        title: "Settings",
        close: "Close settings",
        soundTitle: "Sounds I hear",
        soundHint: "Three layers, tuned to your taste",
        masterAria: "Master sound",
        helpSummary: "How to move",
        desktopHelp:
          "Click the floor · WASD · arrow keys to walk<br>Drag to look around · scroll to zoom<br>1 · E · Space bow/stop · 2 beads · 3 greeting<br>In the moonlight courtyard, dance instead of bowing.<br>Greeting joins palms toward others here.",
        touchHelp:
          "Tap the floor to walk there.<br>One finger pans; pinch to zoom.<br>Tap bow to keep bowing; stop to stand.<br>In the moonlight courtyard, dance instead of bowing.<br>Hold a bead and swipe up/down.<br>Greeting joins palms toward others here.",
      },
      people: {
        title: "People here",
        close: "Close visitors",
        note: "Only real connections are listed; each open tab takes a seat.<br>Tap a novice to glimpse a name; use the greeting below to say hello.",
        retry: "Enter again",
        me: "Me",
        residentsTitle: "Ambient novices (not real visitors)",
      },
      incense: {
        title: "Cyber incense",
        close: "Close incense window",
        description:
          "Cyber incense · a quiet offering<br>Light a stick with crypto — merit without measure 🕯️",
        custom: "Custom amount (USD / USDT)",
        customPh: "e.g. 10",
        name: "Devotee name (optional)",
        namePh: "Anonymous devotee",
        pay: "Light cyber incense · pay with crypto",
        bmcDivider: "Or tip with crypto incense (NOWPayments)",
        bmcAlt: "Buy Me a Coffee QR for maynorai",
        bmcPay: "Buy Me a Coffee · open tip page",
        footnote:
          "Payments via Buy Me a Coffee and NOWPayments. Offerings support Cyber Sansa only. Crypto minimum $10.",
        selected: "Selected {label} (≈ ${usd})",
        minAmount: "Please enter at least $10 (crypto payment minimum)",
        creating: "Creating crypto invoice…",
        createFail: "Couldn’t create invoice ({status})",
        redirect: "Payment opened in a new window — temple stays open…",
        popupBlocked: "Pop-up blocked. Use the link below to open payment in a new tab",
        openPay: "Open NOWPayments in a new window",
        cancelled: "Payment cancelled — the gate stays open",
        missingUrl: "Invoice created but payment link is missing",
        network: "Network error — try again shortly",
        anon: "Anonymous devotee",
        floated: "🕯️ {name} offered ${amount}",
        toast: "🙏 Incense received — merit without measure",
        toastNamed: "🙏 Devotee {name}, incense received — merit without measure",
        toastAnon: "🙏 Incense received — anonymous offering, merit without measure",
        ceremonyTitle: "Incense received",
        ceremonyNamed: "Devotee {name}, your incense has arrived. May you find ease.",
        ceremonyAnon: "An anonymous offering has arrived. May you find ease.",
      },
      success: {
        title: "Incense received · Cyber Sansa",
        heading: "🕯️ Incense received",
        body: "Thank you for the cyber incense offering. May you find ease.",
        back: "Return to the hall",
        closeHint: "You can close this window and return to the temple tab.",
      },
      cancel: {
        title: "Cancelled · Cyber Sansa",
        heading: "Payment cancelled",
        body: "No worry — the gate stays open. Offer again whenever you like.",
        back: "Return to the hall",
        closeHint: "You can close this window and return to the temple tab.",
      },
      beads: {
        back: "Back",
        backAriaReady: "Return to the hall",
        backAriaLoading: "Return to the loading screen",
        title: "Beads",
        titleAria: "Turn prayer beads",
        soundOn: "Unmute",
        soundOff: "Mute",
        counterAria: "Beads turned",
        round: "Round {n}",
        roundFirst: "Round 1",
        counterDetail: "This round {current}, total {total}",
        roundDone: "Completed {n} rounds",
        gesture: "Hold and swipe up or down",
      },
      chrome: {
        remoteGreeting: "{name} greeted you",
        hintTouch: "Tap to walk · Swipe to look · Pinch to zoom",
        helloShort: "Greet",
        bowShort: "Bow",
        beadsShort: "Beads",
        stopShort: "Stop",
        hintDrag: "Drag to look around",
        traveling: "Walking",
        listenChant: "Listen to chant",
        stopChant: "Stop chant",
        listenJointChant: "Listen together",
        muteJointChant: "Mute ceremony",
        bannerListening: "Listening together",
        bannerListen: "Listen together",
        chantTitle: "Chant",
        chantPersonalBtn: "Listen",
        chantPersonalStop: "Pause",
        chantPersonalAria: "Personal chant",
        chantPersonalAriaStop: "Stop personal chant",
        chantJointBtn: "Listen together",
        chantJointMute: "Mute",
        chantJointAria: "Joint ceremony chant",
        chantJointAriaStop: "Mute joint ceremony",
        chantStatusIntro: "Personal listening for you only",
        chantStatusError: "Couldn’t load the chant. Tap again.",
        chantStatusLoading: "Loading chant…",
        chantStatusJointListening: "Listening to {label} together",
        chantStatusPersonalPlaying: "Personal chant for you only",
        chantStatusUnmuteContinue: "Turn sound on to continue",
        chantStatusRest: "Taking a short rest before playing again",
        chantStatusVolumeZero: "Chant volume is 0",
        chantStatusIdle: "Play for you alone when you want",
        chantStatusBackground: "Paused briefly in the background",
        chantStatusJointTime: "Ceremony time · turn sound on to join",
        chantVolumeAria: "Chant volume",
        chantRule: "Daily 05:00 · 18:00, Korea time<br>When the ceremony starts, personal listening ends and everyone listens together.",
        chantCredit: "Audio credits",
        chantNextFrom: "{label} · from {time}",
        chantNextUpcoming: "Next {label} {time}",
        chantJointLabel: "Joint ceremony",
        modes: "What you can do here",
      },
      room: {
        active: "Current",
        full: "Full",
        hall: "Cheongyeondang",
        hallServer: "Cheongyeondang server",
        hallServerN: "Cheongyeondang server {n}",
        hallServerCurrent: "Current · Cheongyeondang server {n}",
        hallServerList: "Cheongyeondang server list",
        hallServerPick: "Choose Cheongyeondang server",
        hallServerPickN: "Cheongyeondang server {n}. Choose server",
        title: "Cheongyeondang servers",
        close: "Close server picker",
        description: "Every server shares the same temple hall.",
        finding: "Looking for a server to join",
        refresh: "Refresh counts",
        enterHall: "Enter Cheongyeondang",
        leaveGarden: "Go to the garden",
        enterMoon: "Enter Moonlight Court",
        garden: "Garden walk",
        moon: "Moonlight Court",
        dawnCeremony: "Dawn ceremony",
        eveningCeremony: "Evening ceremony",
      },
      conn: {
        delay: "Connection is slow. Reconnecting…",
        connecting: "Connecting to Cheongyeondang…",
        connectingOther: "Connecting to another Cheongyeondang…",
        full: "This server is full. Please pick another.",
        fullToast: "This server is full. Choose another in Server select.",
        peopleConnecting: "Connecting. View visitors",
        peopleTogether: "{n} here. View visitors",
        peopleFull: "{n}. Other servers available. View visitors",
        pickServer: "Servers",
      },

      lang: { label: "Language", name: "English" },
    },
    ko: {
      meta: {
        title: "사이버 산사 / Cyber Sansa — 온라인 향화 사찰",
        description:
          "사이버 산사 · 온라인 3D 사찰. 암호화폐로 사이버 향화를 올리세요.",
        ogTitle: "사이버 산사 · Cyber Sansa",
        ogDescription: "온라인 3D 사찰 · 사이버 향화",
        appleTitle: "사이버 산사",
        siteName: "사이버 산사",
      },
      brand: { short: "사이버 산사", full: "사이버 산사 / Cyber Sansa" },
      boot: {
        title: "사이버 산사",
        message: "사이버 법당을 여는 중…",
        retry: "다시 들어가기",
        aria: "사이버 산사",
        noscript:
          "염주를 굴리고, 절하고, 잠깐 쉬어가는 공간입니다. 법당을 보려면 JavaScript를 켜주세요.",
      },
      loading: {
        title: "사이버 산사",
        opening: "법당을 여는 중",
        slow: "법당 준비가 늦어지고 있어요",
        errorTitle: "풍경을 불러오지 못했어요",
        errorMessage: "연결을 확인하고 다시 들어와주세요",
        retry: "다시 들어가기",
        beadsFirst: "염주 먼저 굴리기",
      },
      nav: {
        tools: "산사 도구",
        exit: "산사 나가기",
        people: "방문객 보기",
        soundOn: "소리 켜기",
        soundOff: "소리 끄기",
        settings: "설정",
        support: "사이버 향화",
        supportTitle: "사이버 향화 올리기",
        hello: "합장 인사",
        bow: "절하기",
        beads: "염주 돌리기",
        stop: "이동 멈추기",
        room: "서버 선택",
      },
      settings: {
        title: "설정",
        close: "설정 닫기",
        soundTitle: "내가 듣는 소리",
        soundHint: "세 가지 소리를 내 취향대로",
        masterAria: "기본 소리",
        helpSummary: "조작 방법",
        desktopHelp:
          "바닥 클릭 · WASD · 방향키로 이동<br>드래그로 둘러보기 · 휠로 확대/축소<br>1 · E · Space 절하기/멈추기 · 2 염주 · 3 합장<br>달빛 마당에서는 절하기 대신 춤을 춰요.<br>합장을 누르면 두 손을 모아 인사해요.",
        touchHelp:
          "바닥을 누르면 그곳까지 걸어요.<br>한 손가락으로 쓸어 둘러보고, 두 손가락을 벌리거나 모아 확대/축소해요.<br>절하기를 누르면 계속 절하고, 멈추기를 누르면 일어나요.<br>달빛 마당에서는 절하기 대신 춤을 춰요.<br>염주는 알을 잡고 위아래로 넘겨요.<br>합장을 누르면 두 손을 모아 인사해요.",
      },
      people: {
        title: "함께 있는 사람",
        close: "방문객 창 닫기",
        note: "실제 접속만 손님으로 보여요. 탭을 여러 개 열면 자리가 여러 개 잡혀요.<br>동자승을 누르면 이름이 잠깐 보여요. 하단 합장으로 인사해요.",
        retry: "다시 입장하기",
        me: "나",
        residentsTitle: "상주 동자승 (분위기 역할 · 실제 방문객 아님)",
      },
      incense: {
        title: "사이버 향화",
        close: "향화 창 닫기",
        description:
          "사이버 향화 · 공양 올리기<br>암호화폐로 향 한 자락, 공덕이 가득하길 🕯️",
        custom: "직접 금액 (USD / USDT)",
        customPh: "예: 10",
        name: "시주 이름 (선택)",
        namePh: "익명 향객",
        pay: "사이버 향화 켜기 · 암호화폐 결제",
        bmcDivider: "또는 암호화폐 향화 (NOWPayments)",
        bmcAlt: "Buy Me a Coffee QR (maynorai)",
        bmcPay: "Buy Me a Coffee · 후원 페이지 열기",
        footnote:
          "결제는 Buy Me a Coffee와 NOWPayments에서 처리됩니다. 향화는 사이버 산사 법당만을 위한 것입니다. 암호화폐 최저 $10.",
        selected: "{label} 선택 (약 ${usd})",
        minAmount: "최소 $10 이상 입력해 주세요 (암호화폐 결제 최저액)",
        creating: "암호화폐 결제 청구서를 만드는 중…",
        createFail: "청구서를 만들지 못했어요 ({status})",
        redirect: "결제 창이 새 창에서 열렸습니다. 법당은 그대로 열려 있어요…",
        popupBlocked: "팝업이 차단되었습니다. 아래 링크로 새 탭에서 결제를 열어 주세요",
        openPay: "새 창에서 NOWPayments 열기",
        cancelled: "결제가 취소되었습니다. 산문은 언제나 열려 있어요",
        missingUrl: "청구서는 만들어졌지만 결제 링크가 없어요",
        network: "네트워크 오류예요. 잠시 후 다시 시도해 주세요",
        anon: "익명 향객",
        floated: "🕯️ {name} 님 ${amount} 공양",
        toast: "🙏 향화가 도착했어요. 공덕이 가득하길",
        toastNamed: "🙏 시주 {name} 님, 향화가 도착했어요. 공덕이 가득하길",
        toastAnon: "🙏 향화가 도착했어요 (익명 공양). 공덕이 가득하길",
        ceremonyTitle: "향화가 도착했어요",
        ceremonyNamed: "시주 {name} 님, 향화가 도착했어요. 마음이 편안하시길.",
        ceremonyAnon: "익명 향객의 공양이 도착했어요. 마음이 편안하시길.",
      },
      success: {
        title: "향화 도착 · 사이버 산사",
        heading: "🕯️ 향화가 도착했어요",
        body: "사이버 향화를 올려 주셔서 고맙습니다. 마음이 편안하시길.",
        back: "법당으로 돌아가기",
        closeHint: "창을 닫고 법당 탭으로 돌아가셔도 됩니다.",
      },
      cancel: {
        title: "취소됨 · 사이버 산사",
        heading: "결제가 취소되었어요",
        body: "괜찮아요. 산문은 언제나 열려 있어요. 언제든 다시 올려 주세요.",
        back: "법당으로 돌아가기",
        closeHint: "창을 닫고 법당 탭으로 돌아가셔도 됩니다.",
      },
      beads: {
        back: "돌아가기",
        backAriaReady: "법당으로 돌아가기",
        backAriaLoading: "법당 준비 화면으로 돌아가기",
        title: "염주",
        titleAria: "염주 돌리기",
        soundOn: "소리 켜기",
        soundOff: "소리 끄기",
        counterAria: "넘긴 염주",
        round: "{n}번째 바퀴",
        roundFirst: "첫 번째 바퀴",
        counterDetail: "이번 바퀴 {current}알, 모두 {total}알",
        roundDone: "{n}바퀴 돌렸어요.",
        gesture: "잡고 쓸어 넘기기",
      },
      chrome: {
        remoteGreeting: "{name}님이 합장으로 인사했어요",
        hintTouch: "눌러 이동 · 쓸어 둘러보기 · 두 손가락 확대/축소",
        helloShort: "합장",
        bowShort: "절하기",
        beadsShort: "염주",
        stopShort: "멈추기",
        hintDrag: "화면을 드래그해 둘러보세요",
        traveling: "걷는 중",
        listenChant: "염불 듣기",
        stopChant: "염불 멈추기",
        listenJointChant: "공동 예불 듣기",
        muteJointChant: "예불 소리 끄기",
        bannerListening: "함께 듣는 중",
        bannerListen: "함께 듣기",
        chantTitle: "염불",
        chantPersonalBtn: "듣기",
        chantPersonalStop: "멈춤",
        chantPersonalAria: "개인 염불 듣기",
        chantPersonalAriaStop: "개인 염불 멈추기",
        chantJointBtn: "함께 듣기",
        chantJointMute: "소리 끄기",
        chantJointAria: "공동 예불 듣기",
        chantJointAriaStop: "공동 예불 소리 끄기",
        chantStatusIntro: "나에게만 들리는 개인 듣기",
        chantStatusError: "염불을 불러오지 못했어요. 다시 눌러주세요.",
        chantStatusLoading: "염불을 불러오는 중",
        chantStatusJointListening: "{label}을 함께 듣고 있어요.",
        chantStatusPersonalPlaying: "나에게만 들리는 염불이에요.",
        chantStatusUnmuteContinue: "소리를 켜면 이어서 들을 수 있어요.",
        chantStatusRest: "잠시 쉬고 다시 들려드려요.",
        chantStatusVolumeZero: "염불 크기가 0이에요.",
        chantStatusIdle: "듣고 싶을 때 나에게만 들려요.",
        chantStatusBackground: "백그라운드에서 잠시 멈췄어요.",
        chantStatusJointTime: "공동 예불 시간 · 소리를 켜면 함께 들어요.",
        chantVolumeAria: "염불 크기",
        chantRule: "매일 05:00 · 18:00, 한국 시간<br>예불이 시작되면 개인 듣기는 끝나고 함께 들어요.",
        chantCredit: "음원 정보",
        chantNextFrom: "{label} · {time}부터",
        chantNextUpcoming: "다음 {label} {time}",
        chantJointLabel: "공동 예불",
        modes: "산사에서 할 일",
      },
      room: {
        active: "이용 중",
        full: "만석",
        hall: "청연당",
        hallServer: "청연당 서버",
        hallServerN: "청연당 서버 {n}",
        hallServerCurrent: "현재 · 청연당 서버 {n}",
        hallServerList: "청연당 서버 목록",
        hallServerPick: "청연당 서버 선택",
        hallServerPickN: "청연당 서버 {n}. 서버 선택",
        title: "청연당 서버",
        close: "서버 선택 닫기",
        description: "어느 서버에서도 같은 법당을 이용할 수 있어요.",
        finding: "입장할 서버를 찾고 있어요",
        refresh: "인원 새로고침",
        enterHall: "청연당 들어가기",
        leaveGarden: "정원으로 나가기",
        enterMoon: "달빛 마당 입장",
        garden: "산책 정원",
        moon: "달빛 마당",
        dawnCeremony: "새벽 예불",
        eveningCeremony: "저녁 예불",
      },
      conn: {
        delay: "연결이 지연되고 있어요. 다시 연결하고 있어요.",
        connecting: "청연당에 연결하고 있어요.",
        connectingOther: "다른 청연당으로 연결하고 있어요",
        full: "이 서버가 가득 찼어요. 다른 서버를 골라주세요.",
        fullToast: "이 서버가 가득 찼어요. 서버 선택에서 다른 곳으로 들어갈 수 있어요.",
        peopleConnecting: "연결 중. 방문객 보기",
        peopleTogether: "{n}명 함께 있는 중. 방문객 보기",
        peopleFull: "{n}명. 다른 서버를 선택할 수 있어요. 방문객 보기",
        pickServer: "서버 선택",
      },

      lang: { label: "언어", name: "한국어" },
    },
    ja: {
      meta: {
        title: "サイバー山寺 / Cyber Sansa — オンラインお布施の寺",
        description:
          "サイバー山寺 · オンライン3D寺院。暗号資産でサイバーお香を。",
        ogTitle: "サイバー山寺 · Cyber Sansa",
        ogDescription: "オンライン3D寺院 · サイバーお香",
        appleTitle: "サイバー山寺",
        siteName: "サイバー山寺",
      },
      brand: { short: "サイバー山寺", full: "サイバー山寺 / Cyber Sansa" },
      boot: {
        title: "サイバー山寺",
        message: "サイバー法堂を開いています…",
        retry: "再入場",
        aria: "サイバー山寺",
        noscript:
          "数珠を繰り、礼拝し、ひと息つく場所です。法堂に入るには JavaScript を有効にしてください。",
      },
      loading: {
        title: "サイバー山寺",
        opening: "法堂を開いています…",
        slow: "法堂の準備に少し時間がかかっています",
        errorTitle: "風景を読み込めませんでした",
        errorMessage: "接続を確認して、もう一度お入りください",
        retry: "再入場",
        beadsFirst: "先に数珠を繰る",
      },
      nav: {
        tools: "寺院ツール",
        exit: "サイバー山寺を出る",
        people: "参拝者を見る",
        soundOn: "音をオン",
        soundOff: "音をオフ",
        settings: "設定",
        support: "サイバーお香",
        supportTitle: "サイバーお香を捧げる",
        hello: "合掌のあいさつ",
        bow: "礼拝",
        beads: "数珠を繰る",
        stop: "移動を止める",
        room: "部屋を選ぶ",
      },
      settings: {
        title: "設定",
        close: "設定を閉じる",
        soundTitle: "聞こえる音",
        soundHint: "三つの音を好みに合わせて",
        masterAria: "マスター音",
        helpSummary: "操作方法",
        desktopHelp:
          "床をクリック · WASD · 矢印キーで移動<br>ドラッグで見回し · ホイールでズーム<br>1 · E · Space 礼拝/停止 · 2 数珠 · 3 合掌<br>月明かりの庭では礼拝の代わりに踊ります。<br>合掌で同席の方にあいさつできます。",
        touchHelp:
          "床をタップして歩きます。<br>指一本で見回し、ピンチでズーム。<br>礼拝をタップし続けると拝み、停止で立ちます。<br>月明かりの庭では礼拝の代わりに踊ります。<br>珠を持って上下に繰ります。<br>合掌で同席の方にあいさつできます。",
      },
      people: {
        title: "いっしょにいる人",
        close: "参拝者ウィンドウを閉じる",
        note: "一覧は実接続のみ。タブを複数開くと席も複数使います。<br>童子僧をタップで名前が一瞬。下の合掌であいさつ。",
        retry: "再入場",
        me: "自分",
        residentsTitle: "常駐の童子僧（演出用・訪問者ではありません）",
      },
      incense: {
        title: "サイバーお香",
        close: "お香ウィンドウを閉じる",
        description:
          "サイバーお香 · お布施<br>暗号資産で一筋の香を — 功徳は量り知れません 🕯️",
        custom: "金額を指定 (USD / USDT)",
        customPh: "例: 10",
        name: "寄進者名（任意）",
        namePh: "匿名の参拝者",
        pay: "サイバーお香を灯す · 暗号決済",
        bmcDivider: "または暗号通貨のお香（NOWPayments）",
        bmcAlt: "Buy Me a Coffee QR（maynorai）",
        bmcPay: "Buy Me a Coffee · 支援ページを開く",
        footnote:
          "決済は Buy Me a Coffee と NOWPayments が処理します。お香はサイバー山寺の法堂のみに充てられます。暗号最低 $10。",
        selected: "{label} を選択（約 ${usd}）",
        minAmount: "最低 $10 以上を入力してください（暗号決済の最低額）",
        creating: "暗号決済の請求書を作成中…",
        createFail: "請求書を作成できませんでした ({status})",
        redirect: "支払いを新しいウィンドウで開きました。法堂はそのままです…",
        popupBlocked: "ポップアップがブロックされました。下のリンクから新しいタブで開いてください",
        openPay: "新しいウィンドウで NOWPayments を開く",
        cancelled: "支払いをキャンセルしました。山門は開いています",
        missingUrl: "請求書はできましたが支払いリンクがありません",
        network: "ネットワークエラーです。しばらくしてから再度お試しください",
        anon: "匿名の参拝者",
        floated: "🕯️ {name} さんが ${amount} を寄進",
        toast: "🙏 お香が届きました。功徳は量り知れません",
        toastNamed: "🙏 施主{name}さま、お香が届きました。功徳は量り知れません",
        toastAnon: "🙏 お香が届きました（匿名のご随喜）。功徳は量り知れません",
        ceremonyTitle: "お香が届きました",
        ceremonyNamed: "施主{name}さま、お香が届きました。心穏やかでありますように。",
        ceremonyAnon: "匿名の香客のご随喜が届きました。心穏やかでありますように。",
      },
      success: {
        title: "お香が届きました · サイバー山寺",
        heading: "🕯️ お香が届きました",
        body: "サイバーお香をありがとうございます。心安かれ。",
        back: "法堂へ戻る",
        closeHint: "このウィンドウを閉じて法堂のタブへお戻りください。",
      },
      cancel: {
        title: "キャンセル · サイバー山寺",
        heading: "支払いをキャンセルしました",
        body: "大丈夫です。山門はいつでも開いています。またいつでもどうぞ。",
        back: "法堂へ戻る",
        closeHint: "このウィンドウを閉じて法堂のタブへお戻りください。",
      },
      beads: {
        back: "戻る",
        backAriaReady: "法堂へ戻る",
        backAriaLoading: "準備画面へ戻る",
        title: "数珠",
        titleAria: "数珠を繰る",
        soundOn: "音声をオン",
        soundOff: "音声をオフ",
        counterAria: "繰った数珠",
        round: "{n} 周目",
        roundFirst: "1 周目",
        counterDetail: "この周 {current} 珠、合計 {total} 珠",
        roundDone: "{n} 周終えました",
        gesture: "押さえて上下に繰る",
      },
      chrome: {
        remoteGreeting: "{name}さんが合掌で挨拶しました",
        hintTouch: "タップで移動 · スワイプで視点移動 · ピンチで拡大縮小",
        helloShort: "合掌",
        bowShort: "礼拝",
        beadsShort: "数珠",
        stopShort: "停止",
        hintDrag: "画面をドラッグして見回す",
        traveling: "歩行中",
        listenChant: "読経を聴く",
        stopChant: "読経を止める",
        listenJointChant: "合同読経を聴く",
        muteJointChant: "読経をミュート",
        bannerListening: "一緒に聴いています",
        bannerListen: "一緒に聴く",
        chantTitle: "読経",
        chantPersonalBtn: "聴く",
        chantPersonalStop: "一時停止",
        chantPersonalAria: "個人の読経",
        chantPersonalAriaStop: "個人の読経を止める",
        chantJointBtn: "一緒に聴く",
        chantJointMute: "消音",
        chantJointAria: "合同読経",
        chantJointAriaStop: "合同読経を消音",
        chantStatusIntro: "自分だけに聞こえる個人再生",
        chantStatusError: "読経を読み込めませんでした。もう一度押してください。",
        chantStatusLoading: "読経を読み込み中…",
        chantStatusJointListening: "{label}を一緒に聴いています",
        chantStatusPersonalPlaying: "自分だけに聞こえる読経です",
        chantStatusUnmuteContinue: "音をオンにすると続きを聴けます",
        chantStatusRest: "少し休んでから再生します",
        chantStatusVolumeZero: "読経の音量が 0 です",
        chantStatusIdle: "聴きたいときに自分だけへ再生",
        chantStatusBackground: "バックグラウンドで一時停止中",
        chantStatusJointTime: "合同読経の時間 · 音をオンにして一緒に聴く",
        chantVolumeAria: "読経の音量",
        chantRule: "毎日 05:00 · 18:00（韓国時間）<br>合同読経が始まると個人再生は終わり、みんなで聴きます。",
        chantCredit: "音源情報",
        chantNextFrom: "{label} · {time} から",
        chantNextUpcoming: "次の {label} {time}",
        chantJointLabel: "合同読経",
        modes: "法堂でできること",
      },
      room: {
        active: "現在",
        full: "満員",
        hall: "清縁堂",
        hallServer: "清縁堂サーバー",
        hallServerN: "清縁堂サーバー {n}",
        hallServerCurrent: "現在 · 清縁堂サーバー {n}",
        hallServerList: "清縁堂サーバー一覧",
        hallServerPick: "清縁堂サーバーを選択",
        hallServerPickN: "清縁堂サーバー {n}。サーバー選択",
        title: "清縁堂サーバー",
        close: "サーバー選択を閉じる",
        description: "どのサーバーでも同じ法堂を利用できます。",
        finding: "入れるサーバーを探しています",
        refresh: "人数を更新",
        enterHall: "清縁堂に入る",
        leaveGarden: "庭へ出る",
        enterMoon: "月光の庭へ",
        garden: "散歩の庭",
        moon: "月光の庭",
        dawnCeremony: "夜明けの読経",
        eveningCeremony: "夕方の読経",
      },
      conn: {
        delay: "接続が遅延しています。再接続中…",
        connecting: "清縁堂に接続しています…",
        connectingOther: "別の清縁堂に接続しています…",
        full: "このサーバーは満員です。別のサーバーを選んでください。",
        fullToast: "このサーバーは満員です。サーバー選択から別の部屋に入れます。",
        peopleConnecting: "接続中。訪問者を見る",
        peopleTogether: "{n}人いっしょ。訪問者を見る",
        peopleFull: "{n}人。他のサーバーを選べます。訪問者を見る",
        pickServer: "サーバー選択",
      },

      lang: { label: "言語", name: "日本語" },
    },
    es: {
      meta: {
        title: "Cyber Sansa — Templo en línea e incienso",
        description:
          "Cyber Sansa · templo 3D en línea. Ofrece incienso cibernético con cripto.",
        ogTitle: "Cyber Sansa",
        ogDescription: "Templo 3D en línea · ofrenda de incienso cibernético",
        appleTitle: "Cyber Sansa",
        siteName: "Cyber Sansa",
      },
      brand: { short: "Cyber Sansa", full: "Cyber Sansa" },
      boot: {
        title: "Cyber Sansa",
        message: "Abriendo el templo cibernético…",
        retry: "Volver a entrar",
        aria: "Cyber Sansa",
        noscript:
          "Un lugar para pasar cuentas, reverenciar y descansar. Activa JavaScript para entrar al salón.",
      },
      loading: {
        title: "Cyber Sansa",
        opening: "Abriendo el salón del templo…",
        slow: "El salón tarda un poco más…",
        errorTitle: "No se pudo cargar el paisaje",
        errorMessage: "Revisa la conexión y vuelve a entrar",
        retry: "Volver a entrar",
        beadsFirst: "Primero pasa las cuentas",
      },
      nav: {
        tools: "Herramientas del templo",
        exit: "Salir de Cyber Sansa",
        people: "Ver visitantes",
        soundOn: "Activar sonido",
        soundOff: "Silenciar",
        settings: "Ajustes",
        support: "Incienso cibernético",
        supportTitle: "Ofrecer incienso cibernético",
        hello: "Saludo (hapjang)",
        bow: "Reverencia",
        beads: "Pasar cuentas",
        stop: "Dejar de caminar",
        room: "Elegir sala",
      },
      settings: {
        title: "Ajustes",
        close: "Cerrar ajustes",
        soundTitle: "Sonidos que oigo",
        soundHint: "Tres capas, a tu gusto",
        masterAria: "Sonido principal",
        helpSummary: "Cómo moverse",
        desktopHelp:
          "Clic en el suelo · WASD · flechas para caminar<br>Arrastra para mirar · rueda para zoom<br>1 · E · Espacio reverencia/parar · 2 cuentas · 3 saludo<br>En el patio de luna, baila en lugar de reverenciar.<br>El saludo junta las palmas hacia quienes están aquí.",
        touchHelp:
          "Toca el suelo para caminar hasta allí.<br>Un dedo panoramiza; pellizca para zoom.<br>Toca reverencia para seguir; parar para levantarte.<br>En el patio de luna, baila en lugar de reverenciar.<br>Sujeta una cuenta y desliza arriba/abajo.<br>El saludo junta las palmas hacia quienes están aquí.",
      },
      people: {
        title: "Personas aquí",
        close: "Cerrar visitantes",
        note: "Solo cuentan conexiones reales; cada pestaña ocupa un asiento.<br>Toca un novicio para ver el nombre; saluda con el gesto de abajo.",
        retry: "Volver a entrar",
        me: "Yo",
        residentsTitle: "Novicios residentes (ambiente, no visitantes)",
      },
      incense: {
        title: "Incienso cibernético",
        close: "Cerrar ventana de incienso",
        description:
          "Incienso cibernético · ofrenda<br>Enciende una vara con cripto — mérito sin medida 🕯️",
        custom: "Monto personalizado (USD / USDT)",
        customPh: "p. ej. 10",
        name: "Nombre del devoto (opcional)",
        namePh: "Devoto anónimo",
        pay: "Encender incienso · pagar con cripto",
        bmcDivider: "O aporta con cripto (NOWPayments)",
        bmcAlt: "Código QR de Buy Me a Coffee (maynorai)",
        bmcPay: "Buy Me a Coffee · abrir página",
        footnote:
          "Pagos con Buy Me a Coffee y NOWPayments. Las ofrendas sostienen solo Cyber Sansa. Mínimo cripto $10.",
        selected: "Elegido {label} (≈ ${usd})",
        minAmount: "Introduce al menos $10 (mínimo de pago cripto)",
        creating: "Creando factura cripto…",
        createFail: "No se pudo crear la factura ({status})",
        redirect: "Pago abierto en una ventana nueva — el templo sigue abierto…",
        popupBlocked: "Ventana emergente bloqueada. Usa el enlace de abajo para abrir el pago",
        openPay: "Abrir NOWPayments en una ventana nueva",
        cancelled: "Pago cancelado — la puerta sigue abierta",
        missingUrl: "Factura creada pero falta el enlace de pago",
        network: "Error de red — inténtalo de nuevo en un momento",
        anon: "Devoto anónimo",
        floated: "🕯️ {name} ofreció ${amount}",
        toast: "🙏 Incienso recibido — mérito sin medida",
        toastNamed: "🙏 Devoto/a {name}, incienso recibido — mérito sin medida",
        toastAnon: "🙏 Incienso recibido — ofrenda anónima, mérito sin medida",
        ceremonyTitle: "Incienso recibido",
        ceremonyNamed: "Devoto/a {name}, tu incienso ha llegado. Que encuentres sosiego.",
        ceremonyAnon: "Ha llegado una ofrenda anónima. Que encuentres sosiego.",
      },
      success: {
        title: "Incienso recibido · Cyber Sansa",
        heading: "🕯️ Incienso recibido",
        body: "Gracias por la ofrenda de incienso cibernético. Que encuentres calma.",
        back: "Volver al salón",
        closeHint: "Puedes cerrar esta ventana y volver a la pestaña del templo.",
      },
      cancel: {
        title: "Cancelado · Cyber Sansa",
        heading: "Pago cancelado",
        body: "No pasa nada — la puerta sigue abierta. Ofrece de nuevo cuando quieras.",
        back: "Volver al salón",
        closeHint: "Puedes cerrar esta ventana y volver a la pestaña del templo.",
      },
      beads: {
        back: "Volver",
        backAriaReady: "Volver al salón",
        backAriaLoading: "Volver a la pantalla de carga",
        title: "Cuentas",
        titleAria: "Pasar las cuentas",
        soundOn: "Activar sonido",
        soundOff: "Silenciar",
        counterAria: "Cuentas pasadas",
        round: "Vuelta {n}",
        roundFirst: "Vuelta 1",
        counterDetail: "Esta vuelta {current}, total {total}",
        roundDone: "Completaste {n} vueltas",
        gesture: "Mantén y desliza arriba o abajo",
      },
      chrome: {
        remoteGreeting: "{name} te saludó",
        hintTouch: "Toca para caminar · Desliza para mirar · Pellizca para ampliar",
        helloShort: "Saludo",
        bowShort: "Reverencia",
        beadsShort: "Cuentas",
        stopShort: "Parar",
        hintDrag: "Arrastra para mirar alrededor",
        traveling: "Caminando",
        listenChant: "Escuchar canto",
        stopChant: "Detener canto",
        listenJointChant: "Escuchar juntos",
        muteJointChant: "Silenciar ceremonia",
        bannerListening: "Escuchando juntos",
        bannerListen: "Escuchar juntos",
        chantTitle: "Canto",
        chantPersonalBtn: "Escuchar",
        chantPersonalStop: "Pausa",
        chantPersonalAria: "Canto personal",
        chantPersonalAriaStop: "Detener canto personal",
        chantJointBtn: "Escuchar juntos",
        chantJointMute: "Silenciar",
        chantJointAria: "Canto ceremonial conjunto",
        chantJointAriaStop: "Silenciar ceremonia conjunta",
        chantStatusIntro: "Escucha personal solo para ti",
        chantStatusError: "No se pudo cargar el canto. Inténtalo de nuevo.",
        chantStatusLoading: "Cargando canto…",
        chantStatusJointListening: "Escuchando {label} juntos",
        chantStatusPersonalPlaying: "Canto personal solo para ti",
        chantStatusUnmuteContinue: "Activa el sonido para continuar",
        chantStatusRest: "Un breve descanso antes de volver a reproducir",
        chantStatusVolumeZero: "El volumen del canto es 0",
        chantStatusIdle: "Se reproduce solo para ti cuando quieras",
        chantStatusBackground: "En pausa breve en segundo plano",
        chantStatusJointTime: "Hora de ceremonia · activa el sonido para unirte",
        chantVolumeAria: "Volumen del canto",
        chantRule: "Cada día 05:00 · 18:00, hora de Corea<br>Cuando empieza la ceremonia, la escucha personal termina y todos escuchan juntos.",
        chantCredit: "Créditos de audio",
        chantNextFrom: "{label} · desde {time}",
        chantNextUpcoming: "Próximo {label} {time}",
        chantJointLabel: "Ceremonia conjunta",
        modes: "Qué puedes hacer aquí",
      },
      room: {
        active: "Actual",
        full: "Lleno",
        hall: "Cheongyeondang",
        hallServer: "Servidor Cheongyeondang",
        hallServerN: "Servidor Cheongyeondang {n}",
        hallServerCurrent: "Actual · servidor Cheongyeondang {n}",
        hallServerList: "Lista de servidores Cheongyeondang",
        hallServerPick: "Elegir servidor Cheongyeondang",
        hallServerPickN: "Servidor Cheongyeondang {n}. Elegir servidor",
        title: "Servidores Cheongyeondang",
        close: "Cerrar selector de servidor",
        description: "Cualquier servidor comparte el mismo salón del templo.",
        finding: "Buscando un servidor para entrar",
        refresh: "Actualizar ocupantes",
        enterHall: "Entrar a Cheongyeondang",
        leaveGarden: "Ir al jardín",
        enterMoon: "Entrar al Patio de la Luna",
        garden: "Jardín",
        moon: "Patio de la Luna",
        dawnCeremony: "Ceremonia del alba",
        eveningCeremony: "Ceremonia de la tarde",
      },
      conn: {
        delay: "La conexión va lenta. Reconectando…",
        connecting: "Conectando a Cheongyeondang…",
        connectingOther: "Conectando a otro Cheongyeondang…",
        full: "Este servidor está lleno. Elige otro.",
        fullToast: "Este servidor está lleno. Elige otro en Selección de servidor.",
        peopleConnecting: "Conectando. Ver visitantes",
        peopleTogether: "{n} aquí. Ver visitantes",
        peopleFull: "{n}. Hay otros servidores. Ver visitantes",
        pickServer: "Servidores",
      },

      lang: { label: "Idioma", name: "Español" },
    },
    "pt-BR": {
      meta: {
        title: "Cyber Sansa — Templo online e incenso",
        description:
          "Cyber Sansa · templo 3D online. Ofereça incenso cibernético com cripto.",
        ogTitle: "Cyber Sansa",
        ogDescription: "Templo 3D online · oferta de incenso cibernético",
        appleTitle: "Cyber Sansa",
        siteName: "Cyber Sansa",
      },
      brand: { short: "Cyber Sansa", full: "Cyber Sansa" },
      boot: {
        title: "Cyber Sansa",
        message: "Abrindo o templo cibernético…",
        retry: "Entrar novamente",
        aria: "Cyber Sansa",
        noscript:
          "Um lugar para passar contas, reverenciar e descansar. Ative o JavaScript para entrar no salão.",
      },
      loading: {
        title: "Cyber Sansa",
        opening: "Abrindo o salão do templo…",
        slow: "O salão está demorando um pouco…",
        errorTitle: "Não foi possível carregar a paisagem",
        errorMessage: "Verifique a conexão e entre novamente",
        retry: "Entrar novamente",
        beadsFirst: "Passe as contas primeiro",
      },
      nav: {
        tools: "Ferramentas do templo",
        exit: "Sair de Cyber Sansa",
        people: "Ver visitantes",
        soundOn: "Ativar som",
        soundOff: "Silenciar",
        settings: "Configurações",
        support: "Incenso cibernético",
        supportTitle: "Oferecer incenso cibernético",
        hello: "Saudação (hapjang)",
        bow: "Reverência",
        beads: "Passar contas",
        stop: "Parar de caminhar",
        room: "Escolher sala",
      },
      settings: {
        title: "Configurações",
        close: "Fechar configurações",
        soundTitle: "Sons que ouço",
        soundHint: "Três camadas, ao seu gosto",
        masterAria: "Som principal",
        helpSummary: "Como se mover",
        desktopHelp:
          "Clique no chão · WASD · setas para andar<br>Arraste para olhar · rolagem para zoom<br>1 · E · Espaço reverência/parar · 2 contas · 3 saudação<br>No pátio ao luar, dance em vez de reverenciar.<br>A saudação une as palmas para quem está aqui.",
        touchHelp:
          "Toque no chão para caminhar até lá.<br>Um dedo panoramiza; pinça para zoom.<br>Toque reverência para continuar; parar para levantar.<br>No pátio ao luar, dance em vez de reverenciar.<br>Segure uma conta e deslize para cima/baixo.<br>A saudação une as palmas para quem está aqui.",
      },
      people: {
        title: "Pessoas aqui",
        close: "Fechar visitantes",
        note: "Só conexões reais entram na lista; cada aba ocupa um lugar.<br>Toque um noviço para ver o nome; cumprimente com o gesto abaixo.",
        retry: "Entrar novamente",
        me: "Eu",
        residentsTitle: "Noviços residentes (atmosfera, não visitantes)",
      },
      incense: {
        title: "Incenso cibernético",
        close: "Fechar janela de incenso",
        description:
          "Incenso cibernético · oferta<br>Acenda um stick com cripto — mérito sem medida 🕯️",
        custom: "Valor personalizado (USD / USDT)",
        customPh: "ex.: 10",
        name: "Nome do devoto (opcional)",
        namePh: "Devoto anônimo",
        pay: "Acender incenso · pagar com cripto",
        bmcDivider: "Ou contribua com cripto (NOWPayments)",
        bmcAlt: "QR Code do Buy Me a Coffee (maynorai)",
        bmcPay: "Buy Me a Coffee · abrir página",
        footnote:
          "Pagamentos via Buy Me a Coffee e NOWPayments. As ofertas apoiam apenas o Cyber Sansa. Mínimo cripto $10.",
        selected: "Selecionado {label} (≈ ${usd})",
        minAmount: "Informe pelo menos $10 (mínimo do pagamento cripto)",
        creating: "Criando fatura cripto…",
        createFail: "Não foi possível criar a fatura ({status})",
        redirect: "Pagamento aberto em nova janela — o templo permanece aberto…",
        popupBlocked: "Pop-up bloqueado. Use o link abaixo para abrir o pagamento",
        openPay: "Abrir NOWPayments em nova janela",
        cancelled: "Pagamento cancelado — o portão permanece aberto",
        missingUrl: "Fatura criada, mas falta o link de pagamento",
        network: "Erro de rede — tente de novo em instantes",
        anon: "Devoto anônimo",
        floated: "🕯️ {name} ofereceu ${amount}",
        toast: "🙏 Incenso recebido — mérito sem medida",
        toastNamed: "🙏 Devoto/a {name}, incenso recebido — mérito sem medida",
        toastAnon: "🙏 Incenso recebido — oferta anônima, mérito sem medida",
        ceremonyTitle: "Incenso recebido",
        ceremonyNamed: "Devoto/a {name}, seu incenso chegou. Que você encontre paz.",
        ceremonyAnon: "Uma oferta anônima chegou. Que você encontre paz.",
      },
      success: {
        title: "Incenso recebido · Cyber Sansa",
        heading: "🕯️ Incenso recebido",
        body: "Obrigado pela oferta de incenso cibernético. Que você encontre paz.",
        back: "Voltar ao salão",
        closeHint: "Você pode fechar esta janela e voltar à aba do templo.",
      },
      cancel: {
        title: "Cancelado · Cyber Sansa",
        heading: "Pagamento cancelado",
        body: "Sem problema — o portão permanece aberto. Ofereça de novo quando quiser.",
        back: "Voltar ao salão",
        closeHint: "Você pode fechar esta janela e voltar à aba do templo.",
      },
      beads: {
        back: "Voltar",
        backAriaReady: "Voltar ao salão",
        backAriaLoading: "Voltar à tela de carregamento",
        title: "Contas",
        titleAria: "Passar as contas",
        soundOn: "Ativar som",
        soundOff: "Silenciar",
        counterAria: "Contas passadas",
        round: "Volta {n}",
        roundFirst: "Volta 1",
        counterDetail: "Nesta volta {current}, total {total}",
        roundDone: "Completou {n} voltas",
        gesture: "Segure e deslize para cima ou para baixo",
      },
      chrome: {
        remoteGreeting: "{name} saudou você",
        hintTouch: "Toque para andar · Deslize para olhar · Faça pinça para ampliar",
        helloShort: "Saudação",
        bowShort: "Reverência",
        beadsShort: "Contas",
        stopShort: "Parar",
        hintDrag: "Arraste para olhar ao redor",
        traveling: "Andando",
        listenChant: "Ouvir canto",
        stopChant: "Parar canto",
        listenJointChant: "Ouvir juntos",
        muteJointChant: "Silenciar cerimônia",
        bannerListening: "Ouvindo juntos",
        bannerListen: "Ouvir juntos",
        chantTitle: "Canto",
        chantPersonalBtn: "Ouvir",
        chantPersonalStop: "Pausar",
        chantPersonalAria: "Canto pessoal",
        chantPersonalAriaStop: "Parar canto pessoal",
        chantJointBtn: "Ouvir juntos",
        chantJointMute: "Silenciar",
        chantJointAria: "Canto cerimonial conjunto",
        chantJointAriaStop: "Silenciar cerimônia conjunta",
        chantStatusIntro: "Escuta pessoal só para você",
        chantStatusError: "Não foi possível carregar o canto. Toque de novo.",
        chantStatusLoading: "Carregando canto…",
        chantStatusJointListening: "Ouvindo {label} juntos",
        chantStatusPersonalPlaying: "Canto pessoal só para você",
        chantStatusUnmuteContinue: "Ligue o som para continuar",
        chantStatusRest: "Uma breve pausa antes de tocar de novo",
        chantStatusVolumeZero: "O volume do canto está em 0",
        chantStatusIdle: "Toca só para você quando quiser",
        chantStatusBackground: "Pausado por um momento em segundo plano",
        chantStatusJointTime: "Horário da cerimônia · ligue o som para participar",
        chantVolumeAria: "Volume do canto",
        chantRule: "Diariamente 05:00 · 18:00, horário da Coreia<br>Quando a cerimônia começa, a escuta pessoal termina e todos ouvem juntos.",
        chantCredit: "Créditos de áudio",
        chantNextFrom: "{label} · a partir de {time}",
        chantNextUpcoming: "Próximo {label} {time}",
        chantJointLabel: "Cerimônia conjunta",
        modes: "O que você pode fazer aqui",
      },
      room: {
        active: "Atual",
        full: "Lotado",
        hall: "Cheongyeondang",
        hallServer: "Servidor Cheongyeondang",
        hallServerN: "Servidor Cheongyeondang {n}",
        hallServerCurrent: "Atual · servidor Cheongyeondang {n}",
        hallServerList: "Lista de servidores Cheongyeondang",
        hallServerPick: "Escolher servidor Cheongyeondang",
        hallServerPickN: "Servidor Cheongyeondang {n}. Escolher servidor",
        title: "Servidores Cheongyeondang",
        close: "Fechar seletor de servidor",
        description: "Qualquer servidor compartilha o mesmo salão do templo.",
        finding: "Procurando um servidor para entrar",
        refresh: "Atualizar ocupantes",
        enterHall: "Entrar em Cheongyeondang",
        leaveGarden: "Ir ao jardim",
        enterMoon: "Entrar no Pátio do Luar",
        garden: "Jardim",
        moon: "Pátio do Luar",
        dawnCeremony: "Cerimônia da madrugada",
        eveningCeremony: "Cerimônia da noite",
      },
      conn: {
        delay: "A conexão está lenta. Reconectando…",
        connecting: "Conectando a Cheongyeondang…",
        connectingOther: "Conectando a outro Cheongyeondang…",
        full: "Este servidor está cheio. Escolha outro.",
        fullToast: "Este servidor está cheio. Escolha outro em Seleção de servidor.",
        peopleConnecting: "Conectando. Ver visitantes",
        peopleTogether: "{n} aqui. Ver visitantes",
        peopleFull: "{n}. Há outros servidores. Ver visitantes",
        pickServer: "Servidores",
      },

      lang: { label: "Idioma", name: "Português (Brasil)" },
    },
  };

  function normalize(code) {
    if (!code) return null;
    const raw = String(code).trim().replace(/_/g, "-");
    if (SUPPORTED.includes(raw)) return raw;
    const lower = raw.toLowerCase();
    if (lower === "zh-tw" || lower === "zh-hk" || lower === "zh-hant")
      return "zh-TW";
    if (lower.startsWith("zh")) return "zh-CN";
    if (lower.startsWith("pt")) return "pt-BR";
    if (lower.startsWith("en")) return "en";
    if (lower.startsWith("ko")) return "ko";
    if (lower.startsWith("ja")) return "ja";
    if (lower.startsWith("es")) return "es";
    const base = raw.split("-")[0];
    const hit = SUPPORTED.find(
      (s) => s === base || s.toLowerCase().startsWith(base.toLowerCase())
    );
    return hit || null;
  }

  function detect() {
    try {
      const q = new URLSearchParams(location.search).get("lang");
      const fromQ = normalize(q);
      if (fromQ) return fromQ;
    } catch {}
    try {
      const stored = normalize(localStorage.getItem(STORAGE_KEY));
      if (stored) return stored;
    } catch {}
    // Drop legacy sticky keys (do not copy). Never use navigator / Accept-Language.
    try {
      for (const k of LEGACY_STORAGE_KEYS) {
        if (localStorage.getItem(k) != null) localStorage.removeItem(k);
      }
    } catch {}
    // Simplified Chinese is the default for this edition.
    return "zh-CN";
  }

  let lang = detect();

  function get(path, vars) {
    const parts = path.split(".");
    const lookup = (locale) => parts.reduce((value, part) => value?.[part], dict[locale]);
    const current = lookup(lang);
    const fallback = lang === "zh-CN" ? undefined : lookup("ko");
    let out = typeof current === "string" ? current : typeof fallback === "string" ? fallback : path;
    if (vars) {
      out = out.replace(/\{(\w+)\}/g, (_, k) =>
        vars[k] != null ? String(vars[k]) : ""
      );
    }
    return out;
  }

  function gameCopy(source) {
    if (lang !== "zh-CN") return source;
    const copy = source.trim();
    const exact = GAME_COPY_ZH.get(copy);
    if (exact) return source.replace(copy, exact);
    if (!/[가-힣]|\.mp3/.test(copy)) return source;

    const track = copy.match(/^(.+\.mp3)( · .+)$/);
    const trackTitle = track && GAME_COPY_ZH.get(track[1]);
    if (trackTitle) return trackTitle + track[2];
    const server = copy.match(/^청연당 서버 (\d+), (확인 중|\d+ \/ \d+(?: · .+)?)$/);
    if (server) return `${get("room.hallServerN", { n: server[1] })}，${gameCopy(server[2])}`;
    return source;
  }

  function localizeTexture(texture, paint) {
    const redraw = () => {
      paint();
      texture.needsUpdate = true;
    };
    window.addEventListener("cyber-sansa-lang", redraw);
    texture.addEventListener("dispose", () => {
      window.removeEventListener("cyber-sansa-lang", redraw);
    });
  }

  // Keep original values so the same live game can switch back without a reload.
  const originalGameCopy = new WeakMap();
  const gameCopyAttributes = ["aria-label", "title", "alt", "placeholder"];

  function applyGameCopy() {
    const root = document.getElementById("app");
    if (!root) return;

    function translate(node, property, value) {
      if (!value) return;
      const previous = originalGameCopy.get(node)?.[property];
      const source = previous?.translated === value ? previous.source : value;
      const translated = gameCopy(source);
      if (translated !== source) {
        const record = originalGameCopy.get(node) || {};
        record[property] = { source, translated };
        originalGameCopy.set(node, record);
      } else if (previous) {
        delete originalGameCopy.get(node)[property];
      }
      if (translated === value) return;
      if (property === "data") node.data = translated;
      else node.setAttribute(property, translated);
    }

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (node.parentElement?.closest("script, style, .consultation-dialog, #cyber-lang-select, .visitor-label-name, #visitor-list li:not(.is-resident)")) continue;
      translate(node, "data", node.data);
    }
    for (const el of root.querySelectorAll("[aria-label], [title], [alt], [placeholder]")) {
      if (el.closest(".consultation-dialog")) continue;
      for (const attr of gameCopyAttributes) translate(el, attr, el.getAttribute(attr));
    }
  }

  function setAttr(el, attr, value) {
    if (!el || value == null) return;
    if (attr === "text") {
      if (el.textContent !== value) el.textContent = value;
    } else if (attr === "html") {
      if (el.innerHTML !== value) el.innerHTML = value;
    } else if (el.getAttribute(attr) !== value) {
      el.setAttribute(attr, value);
    }
  }

  function applyMeta() {
    document.documentElement.lang = lang;
    document.title = get("meta.title");
    const map = [
      ['meta[name="description"]', "content", "meta.description"],
      ['meta[name="apple-mobile-web-app-title"]', "content", "meta.appleTitle"],
      ['meta[property="og:title"]', "content", "meta.ogTitle"],
      ['meta[property="og:description"]', "content", "meta.ogDescription"],
      ['meta[property="og:site_name"]', "content", "meta.siteName"],
      ['meta[name="twitter:title"]', "content", "meta.ogTitle"],
      ['meta[name="twitter:description"]', "content", "meta.ogDescription"],
      ['meta[property="og:image:alt"]', "content", "meta.siteName"],
      ['meta[name="twitter:image:alt"]', "content", "meta.siteName"],
    ];
    for (const [sel, attr, key] of map) {
      const el = document.querySelector(sel);
      if (el) el.setAttribute(attr, get(key));
    }
    const ogLocale = {
      "zh-CN": "zh_CN",
      "zh-TW": "zh_TW",
      en: "en_US",
      ko: "ko_KR",
      ja: "ja_JP",
      es: "es_ES",
      "pt-BR": "pt_BR",
    };
    const loc = document.querySelector('meta[property="og:locale"]');
    if (loc) loc.setAttribute("content", ogLocale[lang] || "en_US");
  }

  function applyBoot() {
    const boot = document.getElementById("sansa-boot");
    if (!boot) return;
    const isError =
      boot.classList.contains("is-error") || boot.getAttribute("role") === "alert";
    setAttr(boot, "aria-label", get(isError ? "loading.errorTitle" : "boot.aria"));
    const title = document.getElementById("sansa-boot-title");
    if (title) setAttr(title, "text", get(isError ? "loading.errorTitle" : "boot.title"));
    const msg = document.getElementById("sansa-boot-message");
    if (msg) setAttr(msg, "text", get(isError ? "loading.errorMessage" : "boot.message"));
    const retry = document.querySelector(".sansa-boot-retry");
    if (retry) setAttr(retry, "text", get(isError ? "loading.retry" : "boot.retry"));
  }

  function applyDataI18n(root = document) {
    root.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      const mode = el.getAttribute("data-i18n-mode") || "text";
      setAttr(el, mode, get(key));
    });
    root.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      el.setAttribute("placeholder", get(el.getAttribute("data-i18n-placeholder")));
    });
    root.querySelectorAll("[data-i18n-aria]").forEach((el) => {
      el.setAttribute("aria-label", get(el.getAttribute("data-i18n-aria")));
    });
    root.querySelectorAll("[data-i18n-title]").forEach((el) => {
      el.setAttribute("title", get(el.getAttribute("data-i18n-title")));
    });
  }


  function applyBeadsChrome() {
    const host = document.getElementById("beads-host");
    if (!host) return;
    const back = host.querySelector(".beads-back");
    if (back) {
      const span = back.querySelector("span");
      if (span) setAttr(span, "text", get("beads.back"));
      const ready = document.querySelector(".sansa-game.is-ready");
      setAttr(
        back,
        "aria-label",
        ready ? get("beads.backAriaReady") : get("beads.backAriaLoading")
      );
    }
    const title = host.querySelector(".beads-view-title");
    if (title) setAttr(title, "text", get("beads.title"));
    const view = host.querySelector(".sansa-beads-view");
    if (view) setAttr(view, "aria-label", get("beads.titleAria"));
    const sound = host.querySelector(".beads-sound");
    if (sound) {
      const off =
        sound.getAttribute("aria-pressed") === "true" ||
        /끄기|Mute|关闭|關閉|オフ|Silenciar/i.test(sound.getAttribute("aria-label") || "");
      setAttr(sound, "aria-label", off ? get("beads.soundOff") : get("beads.soundOn"));
    }
    const counter = host.querySelector(".beads-counter");
    if (counter) setAttr(counter, "aria-label", get("beads.counterAria"));
    const round = host.querySelector(".beads-round");
    if (round) {
      const raw = (round.textContent || "").trim();
      let n = null;
      const m =
        raw.match(/(\d+)\s*(?:번째\s*바퀴|周目|圈|Round|Vuelta|volta)/i) ||
        raw.match(/(?:Round|Vuelta|volta|第)\s*(\d+)/i);
      if (m) n = Number(m[1]);
      else if (/첫|1\s*周|第\s*1|Round\s*1|Vuelta\s*1|Volta\s*1/i.test(raw)) n = 1;
      if (n === 1) setAttr(round, "text", get("beads.roundFirst"));
      else if (n != null && n > 0) setAttr(round, "text", get("beads.round", { n }));
    }
    const gesture = host.querySelector("#beads-gesture-guide, .beads-gesture-guide");
    if (gesture) setAttr(gesture, "text", get("beads.gesture"));
    const live = host.querySelector(".beads-live");
    if (live) {
      const t = live.textContent || "";
      const m = t.match(/(\d+)/);
      if (m && /바퀴|rounds|vueltas|voltas|周|圈/i.test(t)) {
        setAttr(live, "text", get("beads.roundDone", { n: m[1] }));
      }
    }
  }

  function applyGameChrome() {
    const loading = document.getElementById("game-loading");
    if (loading) {
      const h1 = loading.querySelector("h1");
      const isError = loading.getAttribute("role") === "alert";
      if (h1) {
        const txt = h1.textContent || "";
        if (
          isError ||
          /풍경을 불러오지|Couldn’t load|未能载入|無法載入|風景を|paisaje|paisagem/i.test(
            txt
          )
        ) {
          setAttr(h1, "text", get("loading.errorTitle"));
        } else {
          setAttr(h1, "text", get("loading.title"));
        }
      }
      const msg = document.getElementById("game-loading-message");
      if (msg) {
        const t = msg.textContent || "";
        if (/연결을 확인|Check your|请检查|請檢查|接続を|Revisa|Verifique/i.test(t)) {
          setAttr(msg, "text", get("loading.errorMessage"));
        } else if (/늦어지고|taking a little|稍慢|稍候|少し時間|tarda|demorando/i.test(t)) {
          setAttr(msg, "text", get("loading.slow"));
        } else if (
          /법당을 여는|Opening the temple|开启法堂|開啟法堂|法堂を|Abriendo el salón|Abrindo o salão|正在开启赛博|법당을 여는 중/i.test(
            t
          )
        ) {
          // Map known opening strings only — avoid rewriting arbitrary progress text
          if (!isError) setAttr(msg, "text", get("loading.opening"));
        }
      }
      const beadsBtn = document.getElementById("loading-beads");
      if (beadsBtn) setAttr(beadsBtn, "text", get("loading.beadsFirst"));
      loading.querySelectorAll("button.solid-button").forEach((btn) => {
        if (/다시|Enter again|重新|再入場|Volver|Entrar novamente/i.test(btn.textContent || "")) {
          setAttr(btn, "text", get("loading.retry"));
        }
      });
    }

    const pairs = [
      ["#game-exit", "aria-label", "nav.exit"],
      ["#game-exit", "title", "nav.exit"],
      ["#game-people", "aria-label", "nav.people"],
      ["#game-settings", "aria-label", "nav.settings"],
      ["#game-support", "aria-label", "nav.support"],
      ["#game-support", "title", "nav.supportTitle"],
      ["#game-room", "aria-label", "nav.room"],
      ["#game-stop", "aria-label", "nav.stop"],
      ['nav.game-tools[data-liquid-nav="tools"]', "aria-label", "nav.tools"],
      ["#settings-title", "text", "settings.title"],
      ["#sound-title", "text", "settings.soundTitle"],
      ["#people-title", "text", "people.title"],
      ["#support-title", "text", "incense.title"],
      ["#support-description", "html", "incense.description"],
      ["#cyber-incense-pay", "text", "incense.pay"],
      ["#support-bmc-divider", "text", "incense.bmcDivider"],
      ["#support-link", "text", "incense.bmcPay"],
      ["#retry-entry", "text", "people.retry"],
      ["#audio-toggle", "aria-label", "settings.masterAria"],
    ];
    for (const [sel, attr, key] of pairs) {
      const el = document.querySelector(sel);
      if (!el) continue;
      setAttr(el, attr, get(key));
    }

    // brand short label in header
    document.querySelectorAll("[data-i18n='brand.short'], .game-brand > span").forEach((el) => {
      if (el.id) return;
      if (el.closest && el.closest(".game-brand")) {
        setAttr(el, "text", get("brand.short"));
      }
    });

    // settings close / people close / support close aria
    const settingsClose = document.querySelector(
      "#settings-dialog .dialog-close"
    );
    if (settingsClose) settingsClose.setAttribute("aria-label", get("settings.close"));
    const peopleClose = document.querySelector("#people-dialog .dialog-close");
    if (peopleClose) peopleClose.setAttribute("aria-label", get("people.close"));
    const supportClose = document.querySelector("#support-dialog .dialog-close");
    if (supportClose) supportClose.setAttribute("aria-label", get("incense.close"));

    // sound hint paragraph under sound-title
    const soundTitle = document.getElementById("sound-title");
    if (soundTitle && soundTitle.nextElementSibling && soundTitle.nextElementSibling.tagName === "P") {
      setAttr(soundTitle.nextElementSibling, "text", get("settings.soundHint"));
    }

    const helpSummary = document.querySelector(".control-help > summary");
    if (helpSummary) setAttr(helpSummary, "text", get("settings.helpSummary"));
    const desk = document.querySelector(".control-help .desktop-help");
    if (desk) setAttr(desk, "html", get("settings.desktopHelp"));
    const touch = document.querySelector(".control-help .touch-help");
    if (touch) setAttr(touch, "html", get("settings.touchHelp"));

    const peopleNote = document.querySelector("#people-dialog .small-note");
    if (peopleNote) setAttr(peopleNote, "html", get("people.note"));

    // incense form labels
    const customLabel = document.querySelector("label.cyber-incense-custom");
    if (customLabel) {
      const input = customLabel.querySelector("input");
      customLabel.childNodes.forEach((n) => {
        if (n.nodeType === 3 && n.textContent.trim()) {
          const next = get("incense.custom") + "\n    ";
          if (n.textContent !== next) n.textContent = next;
        }
      });
      if (input) {
        input.setAttribute("placeholder", get("incense.customPh"));
        input.setAttribute("min", "10");
        input.setAttribute("step", "1");
      }
    }
    const nameLabel = document.querySelector("label.cyber-incense-name");
    if (nameLabel) {
      const input = nameLabel.querySelector("input");
      nameLabel.childNodes.forEach((n) => {
        if (n.nodeType === 3 && n.textContent.trim()) {
          const next = get("incense.name") + "\n    ";
          if (n.textContent !== next) n.textContent = next;
        }
      });
      if (input) input.setAttribute("placeholder", get("incense.namePh"));
    }
    // BMC QR alt + tip link
    const bmcQr = document.querySelector("#support-dialog img.support-qr");
    if (bmcQr) bmcQr.setAttribute("alt", get("incense.bmcAlt"));
    const bmcLink = document.getElementById("support-link");
    if (bmcLink) {
      bmcLink.setAttribute("href", "https://www.buymeacoffee.com/maynorai");
      bmcLink.removeAttribute("hidden");
      bmcLink.removeAttribute("aria-hidden");
      bmcLink.removeAttribute("tabindex");
      setAttr(bmcLink, "text", get("incense.bmcPay"));
    }
    const bmcDiv = document.getElementById("support-bmc-divider");
    if (bmcDiv) setAttr(bmcDiv, "text", get("incense.bmcDivider"));

    // footnote under incense (last .small-note in support dialog that isn't status/divider)
    const status = document.getElementById("cyber-incense-status");
    const divider = document.getElementById("support-bmc-divider");
    document.querySelectorAll("#support-dialog > p.small-note").forEach((p) => {
      if (p !== status && p !== divider) setAttr(p, "text", get("incense.footnote"));
    });


    // Visible mode / travel labels (bundle ships Korean spans)
    const helloLabel = document.getElementById("game-hello-label");
    const helloBtn = document.getElementById("hello");
    const greetingState = helloBtn?.dataset.greetingState;
    if (helloBtn) {
      const greetingAria = lang === "zh-CN" && { queued: "절을 마치고 합장 인사", active: "합장 인사 중" }[greetingState];
      setAttr(helloBtn, "aria-label", greetingAria ? gameCopy(greetingAria) : get("nav.hello"));
    }
    if (helloLabel && helloBtn) {
      const greetingLabel = lang === "zh-CN" && { queued: "인사 대기", active: "합장 중" }[greetingState];
      if (greetingLabel) setAttr(helloLabel, "text", gameCopy(greetingLabel));
      else if (greetingState !== "active" && greetingState !== "queued") {
        setAttr(helloLabel, "text", get("chrome.helloShort"));
      }
    }
    const bowLabel = document.getElementById("game-bow-label");
    const bowBtn = document.getElementById("game-bow");
    if (bowBtn) {
      const action = lang === "zh-CN" && bowBtn.dataset.bowAction;
      setAttr(bowBtn, "aria-label", action ? gameCopy(action) : get("nav.bow"));
      setAttr(bowLabel, "text", action ? gameCopy(action) : get("chrome.bowShort"));
    }
    document.querySelectorAll('button[data-mode="beads"] > span').forEach((el) => {
      setAttr(el, "text", get("chrome.beadsShort"));
    });
    const stopBtn = document.getElementById("game-stop");
    if (stopBtn) {
      setAttr(stopBtn, "text", get("chrome.stopShort"));
      setAttr(stopBtn, "aria-label", get("nav.stop"));
    }
    const travelLabel = document.getElementById("game-travel-label");
    if (travelLabel && (lang !== "zh-CN" || travelLabel.dataset.walkAction)) {
      setAttr(travelLabel, "text",
        lang === "zh-CN" ? gameCopy(travelLabel.dataset.walkAction) : get("chrome.traveling"));
    }
    const hint = document.getElementById("game-hint");
    if (hint && /드래그|Drag|拖动|拖曳|ドラッグ|Arrastra|Arraste/i.test(hint.textContent || "")) {
      setAttr(hint, "text", lang === "zh-CN"
        ? gameCopy("바닥 클릭 · 드래그로 둘러보기 · 휠로 확대/축소")
        : get("chrome.hintDrag"));
    }
    // Chant invite — state-aware (game render also uses i18n; this covers lang switch)
    const chantInvite = document.getElementById("chant-invite");
    if (chantInvite) {
      const pressed = chantInvite.getAttribute("aria-pressed") === "true";
      const banner = document.getElementById("chant-banner");
      const joint = document.getElementById("chant-joint");
      const jointActive = banner && !banner.hasAttribute("hidden");
      const jointPlaying =
        (joint && joint.getAttribute("aria-pressed") === "true") || pressed;
      let key = "chrome.listenChant";
      if (jointActive) {
        key = jointPlaying ? "chrome.muteJointChant" : "chrome.listenJointChant";
      } else if (pressed) {
        key = "chrome.stopChant";
      }
      setAttr(chantInvite, "text", get(key));
    }
    const chantTitle = document.getElementById("chant-title");
    if (chantTitle) setAttr(chantTitle, "text", get("chrome.chantTitle"));
    const chantPersonal = document.getElementById("chant-personal");
    if (chantPersonal) {
      const on = chantPersonal.getAttribute("aria-pressed") === "true";
      setAttr(
        chantPersonal,
        "text",
        get(on ? "chrome.chantPersonalStop" : "chrome.chantPersonalBtn")
      );
      setAttr(
        chantPersonal,
        "aria-label",
        get(on ? "chrome.chantPersonalAriaStop" : "chrome.chantPersonalAria")
      );
    }
    const chantJoint = document.getElementById("chant-joint");
    if (chantJoint) {
      const on = chantJoint.getAttribute("aria-pressed") === "true";
      setAttr(
        chantJoint,
        "text",
        get(on ? "chrome.chantJointMute" : "chrome.chantJointBtn")
      );
      setAttr(
        chantJoint,
        "aria-label",
        get(on ? "chrome.chantJointAriaStop" : "chrome.chantJointAria")
      );
    }
    const chantVol = document.getElementById("chant-volume");
    if (chantVol) setAttr(chantVol, "aria-label", get("chrome.chantVolumeAria"));
    document.querySelectorAll("#chant-section .sansa-sr").forEach((el) => {
      setAttr(el, "text", get("chrome.chantVolumeAria"));
    });
    const chantRule = document.querySelector("#chant-section .chant-rule");
    if (chantRule) setAttr(chantRule, "html", get("chrome.chantRule"));
    const chantCredit = document.querySelector("#chant-section ~ details.sound-credit summary, .sound-credit > summary");
    if (chantCredit) setAttr(chantCredit, "text", get("chrome.chantCredit"));
    // Connection chrome
    const connNote = document.getElementById("connection-note");
    const connLabel = document.getElementById("game-connection-label");
    const connBtn = document.getElementById("connection-rooms");
    if (connBtn) setAttr(connBtn, "text", get("conn.pickServer"));
    const rewriteConn = (el) => {
      if (!el) return;
      const t = el.textContent || "";
      if (/연결이 지연|Connection is slow|连接延迟|連線延遲|接続が遅延|conexión va lenta|conexão está lenta/i.test(t)) {
        setAttr(el, "text", get("conn.delay"));
      } else if (/다른 청연당|another Cheongyeondang|其他清缘|其他清緣|別の清縁|otro Cheongyeondang|outro Cheongyeondang/i.test(t)) {
        setAttr(el, "text", get("conn.connectingOther"));
      } else if (/청연당에 연결|Connecting to Cheongyeondang|正在连接清缘|正在連線清緣|清縁堂に接続|Conectando a Cheongyeondang/i.test(t)) {
        setAttr(el, "text", get("conn.connecting"));
      } else if (/가득 찼어요\. 다른 서버|server is full\. Please|此服务器已满，请选择|此伺服器已滿，請選擇|このサーバーは満員です。別|servidor está lleno\. Elige|servidor está cheio\. Escolha/i.test(t)) {
        setAttr(el, "text", get("conn.full"));
      }
    };
    rewriteConn(connNote);
    rewriteConn(connLabel);
    const toast = document.getElementById("game-toast");
    if (toast) {
      const t = toast.textContent || "";
      if (/가득 찼어요\. 서버 선택|server is full\. Choose another in|此服务器已满。可在|此伺服器已滿。可在|このサーバーは満員です。サーバー|servidor está lleno\. Elige otro en|servidor está cheio\. Escolha outro em/i.test(t)) {
        setAttr(toast, "text", get("conn.fullToast"));
      }
    }
    // Room dialog
    const roomTitle = document.getElementById("room-title");
    if (roomTitle) setAttr(roomTitle, "text", get("room.title"));
    const roomClose = document.querySelector("#room-dialog .dialog-close");
    if (roomClose) setAttr(roomClose, "aria-label", get("room.close"));
    const roomDesc = document.querySelector("#room-dialog .dialog-description");
    if (roomDesc) setAttr(roomDesc, "text", get("room.description"));
    const roomRefresh = document.getElementById("room-refresh");
    if (roomRefresh) setAttr(roomRefresh, "text", get("room.refresh"));
    const roomList = document.getElementById("room-list");
    if (roomList) setAttr(roomList, "aria-label", get("room.hallServerList"));
    const roomCurrent = document.getElementById("room-current");
    if (roomCurrent) {
      const t = roomCurrent.textContent || "";
      const m = t.match(/(\d+)/);
      if (m && /현재|Current|当前|目前|現在|Actual|Atual/i.test(t)) {
        setAttr(roomCurrent, "text", get("room.hallServerCurrent", { n: m[1] }));
      } else if (/입장할 서버|Looking for a server|正在寻找|正在尋找|入れるサーバー|Buscando un servidor|Procurando um servidor/i.test(t)) {
        setAttr(roomCurrent, "text", get("room.finding"));
      }
    }
    document.querySelectorAll("#room-list .room-choice strong, #room-list strong").forEach((el) => {
      const m = (el.textContent || "").match(/(\d+)/);
      if (m) setAttr(el, "text", get("room.hallServerN", { n: m[1] }));
    });
    const gameRoom = document.getElementById("game-room");
    if (gameRoom) {
      const nMatch = (gameRoom.textContent || "").match(/(\d+)/);
      // aria only — visible label may include number span
      if (nMatch) setAttr(gameRoom, "aria-label", get("room.hallServerPickN", { n: nMatch[1] }));
      else setAttr(gameRoom, "aria-label", get("room.hallServerPick"));
    }

    const modesNav = document.querySelector("nav.game-modes");
    if (modesNav) setAttr(modesNav, "aria-label", get("chrome.modes"));

    applyBeadsChrome();

    // sound button aria based on pressed/checked if possible
    const soundBtn = document.getElementById("game-sound");
    if (soundBtn) {
      const on = soundBtn.getAttribute("aria-checked") === "true" || soundBtn.getAttribute("aria-pressed") === "true";
      // original toggles aria-label between 소리 켜기 / 끄기 — leave generic unmute label; game may overwrite
      if (!soundBtn.dataset.i18nSoundLocked) {
        const cur = soundBtn.getAttribute("aria-label") || "";
        if (/끄기|Mute|关闭|關閉|オフ|Silenciar/i.test(cur)) {
          soundBtn.setAttribute("aria-label", get("nav.soundOff"));
        } else {
          soundBtn.setAttribute("aria-label", get("nav.soundOn"));
        }
      }
    }
  }

  function ensureSwitcher() {
    let host = document.getElementById("cyber-lang-switcher");
    if (!host) {
      host = document.createElement("div");
      host.id = "cyber-lang-switcher";
      host.innerHTML = `<label class="cyber-lang-label"><span class="cyber-lang-caption"></span>
        <select id="cyber-lang-select" aria-label="Language"></select></label>`;
    }
    const tools = document.querySelector("nav.game-tools");
    const settings = document.getElementById("settings-dialog");
    if (settings && matchMedia("(max-width: 480px)").matches) {
      if (host.parentElement !== settings) settings.querySelector("header").after(host);
      host.className = "cyber-lang-in-settings";
    } else if (tools) {
      if (host.parentElement !== tools) tools.appendChild(host);
      host.className = "cyber-lang-in-nav";
    } else {
      if (host.parentElement !== document.body) document.body.appendChild(host);
      host.className = "cyber-lang-floating";
    }

    const select = document.getElementById("cyber-lang-select");
    const caption = host.querySelector(".cyber-lang-caption");
    if (caption) setAttr(caption, "text", get("lang.label"));
    if (select) {
      select.setAttribute("aria-label", get("lang.label"));
      if (!select.dataset.filled) {
        select.innerHTML = SUPPORTED.map(
          (code) =>
            `<option value="${code}">${dict[code].lang.name}</option>`
        ).join("");
        select.dataset.filled = "1";
        const onPick = () => setLang(select.value, { reloadIfNeeded: false });
        select.addEventListener("change", onPick);
        // Keep usable inside liquid-nav chrome
        select.style.pointerEvents = "auto";
        host.style.pointerEvents = "auto";
      }
      for (const [index, option] of Array.from(select.options).entries()) {
        setAttr(option, "text", lang === "zh-CN" ? LANGUAGE_NAMES_ZH[index] : dict[option.value].lang.name);
      }
      select.value = lang;
    }
  }

  matchMedia("(max-width: 480px)").addEventListener("change", ensureSwitcher);

  function injectSwitcherStyle() {
    if (document.getElementById("cyber-i18n-style")) return;
    const s = document.createElement("style");
    s.id = "cyber-i18n-style";
    s.textContent = `
#cyber-lang-switcher.cyber-lang-floating{position:fixed;top:max(10px,env(safe-area-inset-top));right:max(10px,env(safe-area-inset-right));z-index:60;font:12px/1.2 system-ui,sans-serif}
#cyber-lang-switcher.cyber-lang-in-nav{display:inline-flex;align-items:center;margin-left:4px}
#cyber-lang-switcher .cyber-lang-label{display:inline-flex;align-items:center;gap:6px;padding:4px 8px;border-radius:999px;background:rgba(36,37,31,.55);color:#f5f1e8;backdrop-filter:blur(8px)}
#cyber-lang-switcher.cyber-lang-in-nav .cyber-lang-label{background:rgba(36,37,31,.35);padding:2px 6px}
#cyber-lang-switcher .cyber-lang-caption{opacity:.85;font-size:11px}
#cyber-lang-switcher select{appearance:none;border:1px solid rgba(245,241,232,.35);background:transparent;color:inherit;border-radius:6px;padding:2px 6px;font:inherit;max-width:9.5rem;cursor:pointer}
#cyber-lang-switcher select:focus-visible{outline:2px solid #988762;outline-offset:2px}
#cyber-lang-switcher option{color:#1c1d18;background:#f5f1e8}
`;
    document.head.appendChild(s);
  }

  function applySuccessCancel() {
    const path = location.pathname.replace(/\.html$/, "");
    if (path.endsWith("/incense/success")) {
      document.title = get("success.title");
      const h1 = document.querySelector("main h1");
      const ps = document.querySelectorAll("main p");
      if (h1) h1.textContent = get("success.heading");
      if (ps[0]) ps[0].textContent = get("success.body");
      const a = document.querySelector("main a");
      if (a) a.textContent = get("success.back");
    }
    if (path.endsWith("/incense/cancel")) {
      document.title = get("cancel.title");
      const h1 = document.querySelector("main h1");
      const ps = document.querySelectorAll("main p");
      if (h1) h1.textContent = get("cancel.heading");
      if (ps[0]) ps[0].textContent = get("cancel.body");
      const a = document.querySelector("main a");
      if (a) a.textContent = get("cancel.back");
    }
  }

  function applyAll() {
    injectSwitcherStyle();
    applyMeta();
    applyBoot();
    applyDataI18n();
    applyGameChrome();
    if (lang === "zh-CN") applyGameCopy();
    applySuccessCancel();
    ensureSwitcher();
  }

  function setLang(next, { persist = true, reloadIfNeeded = false } = {}) {
    const n = normalize(next) || lang;
    const wasSimplified = lang === "zh-CN";
    lang = n;
    if (wasSimplified && lang !== "zh-CN") applyGameCopy();
    if (persist) {
      try {
        localStorage.setItem(STORAGE_KEY, n);
      } catch {}
    }
    // keep ?lang= in URL without reload
    try {
      const url = new URL(location.href);
      url.searchParams.set("lang", n);
      history.replaceState({}, "", url);
    } catch {}
    safeApplyAll();
    window.dispatchEvent(
      new CustomEvent("cyber-sansa-lang", { detail: { lang: n } })
    );
    if (reloadIfNeeded) location.reload();
  }

  // Observe game DOM injection. Never watch characterData: apply* writes
  // would re-enter the observer and freeze the main thread ("Page Unresponsive").
  let applying = false;
  let moQueued = false;
  const mo = new MutationObserver(() => {
    if (applying || moQueued) return;
    moQueued = true;
    queueMicrotask(() => {
      moQueued = false;
      if (applying) return;
      applying = true;
      try {
        mo.disconnect();
        applyBoot();
        applyGameChrome();
        if (lang === "zh-CN") applyGameCopy();
        ensureSwitcher();
      } finally {
        applying = false;
        startObserver();
      }
    });
  });

  function startObserver() {
    const root = document.getElementById("app") || document.body;
    if (!root) return;
    try {
      mo.observe(root, {
        childList: true,
        subtree: true,
        // attributes/characterData omitted on purpose — text patches must not feedback
      });
    } catch {}
  }

  function safeApplyAll() {
    if (applying) return;
    applying = true;
    try {
      mo.disconnect();
      applyAll();
    } finally {
      applying = false;
      startObserver();
    }
  }

  function boot() {
    safeApplyAll();
    startObserver();
    // Re-apply a few times as the SPA mounts
    [800, 2000, 5000, 12000].forEach((ms) => setTimeout(safeApplyAll, ms));

    // While beads overlay is open, refresh localized round/back labels.
    // Bundle may rewrite Korean on every bead; keep zh-CN etc. in sync without characterData MO.
    setInterval(() => {
      if (applying) return;
      const game = document.querySelector(".sansa-game");
      if (!game) return;
      applying = true;
      try {
        mo.disconnect();
        if (game.classList.contains("is-beading")) applyBeadsChrome();
        // Keep connection + chant labels localized; game render rewrites KO often
        applyGameChrome();
        if (lang === "zh-CN") applyGameCopy();
        ensureSwitcher();
      } finally {
        applying = false;
        startObserver();
      }
    }, 700);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  window.CyberSansaI18n = {
    SUPPORTED,
    get lang() {
      return lang;
    },
    t: get,
    gameCopy,
    localizeTexture,
    setLang,
    apply: safeApplyAll,
    detect,
  };
})();
