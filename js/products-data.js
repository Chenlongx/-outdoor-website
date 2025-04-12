const productsData = {
    camping: {
        name: '露营装备',
        subcategories: {
            tents: '帐篷',
            sleeping: '睡袋',
            furniture: '露营家具',
            cooking: '炊具',
            lighting: '照明',
            storage: '收纳'
        },
        products: [
            {
                id: 'tent-001',
                name: '高级露营帐篷',
                price: 999,
                originalPrice: 1299,
                image: '../img/products/tent-001.jpg',
                subcategory: 'tents',
                description: '防风防雨，适合2-3人使用的高级露营帐篷',
                features: [
                    '防水面料',
                    '快速搭建',
                    '通风设计',
                    '防蚊虫网'
                ],
                specifications: {
                    '尺寸': '220x180x120cm',
                    '重量': '2.5kg',
                    '容量': '2-3人',
                    '材质': '涤纶+PU涂层'
                }
            },
            {
                id: 'sleeping-001',
                name: '野外睡袋',
                price: 299,
                originalPrice: 399,
                image: '../img/products/sleeping-001.jpg',
                subcategory: 'sleeping',
                description: '保暖舒适的野外睡袋，适合春秋季节使用',
                features: [
                    '保暖填充',
                    '防水面料',
                    '轻便易携',
                    '可压缩收纳'
                ],
                specifications: {
                    '尺寸': '220x80cm',
                    '重量': '1.2kg',
                    '温度范围': '0-15℃',
                    '材质': '涤纶+羽绒填充'
                }
            }
        ]
    },
    hiking: {
        name: '徒步装备',
        subcategories: {
            backpacks: '背包',
            clothing: '服装',
            footwear: '鞋靴',
            accessories: '配件'
        },
        products: [
            {
                id: 'backpack-001',
                name: '探险者背包',
                price: 599,
                originalPrice: 799,
                image: '../img/products/backpack-001.jpg',
                subcategory: 'backpacks',
                description: '大容量防水徒步背包，适合长途徒步',
                features: [
                    '防水面料',
                    '背负系统',
                    '多口袋设计',
                    '防雨罩'
                ],
                specifications: {
                    '容量': '45L',
                    '重量': '1.5kg',
                    '材质': '尼龙+PU涂层',
                    '防水等级': 'IPX4'
                }
            }
        ]
    },
    climbing: {
        name: '攀岩装备',
        subcategories: {
            harnesses: '安全带',
            ropes: '绳索',
            hardware: '硬件',
            protection: '保护装备'
        },
        products: [
            {
                id: 'harness-001',
                name: '专业攀岩安全带',
                price: 399,
                originalPrice: 499,
                image: '../img/products/harness-001.jpg',
                subcategory: 'harnesses',
                description: '轻量化专业攀岩安全带，适合室内外攀岩',
                features: [
                    '轻量化设计',
                    '多点调节',
                    '透气面料',
                    '装备环'
                ],
                specifications: {
                    '重量': '0.8kg',
                    '材质': '尼龙+聚酯纤维',
                    '承重': '15kN',
                    '尺寸范围': '60-120cm'
                }
            }
        ]
    },
    apparel: {
        name: '户外服装',
        subcategories: {
            jackets: '外套',
            pants: '裤子',
            shirts: '上衣',
            underwear: '内衣'
        },
        products: [
            {
                id: 'jacket-001',
                name: '防水冲锋衣',
                price: 799,
                originalPrice: 999,
                image: '../img/products/jacket-001.jpg',
                subcategory: 'jackets',
                description: '防风防雨透气冲锋衣，适合各种户外活动',
                features: [
                    '防水透气',
                    '防风保暖',
                    '可调节帽兜',
                    '多口袋设计'
                ],
                specifications: {
                    '防水等级': '10000mm',
                    '透气度': '8000g/m²/24h',
                    '材质': 'GORE-TEX面料',
                    '重量': '0.6kg'
                }
            }
        ]
    },
    footwear: {
        name: '户外鞋靴',
        subcategories: {
            hiking: '徒步鞋',
            climbing: '攀岩鞋',
            running: '越野跑鞋',
            sandals: '凉鞋'
        },
        products: [
            {
                id: 'hiking-001',
                name: '专业徒步鞋',
                price: 699,
                originalPrice: 899,
                image: '../img/products/hiking-001.jpg',
                subcategory: 'hiking',
                description: '防滑耐磨专业徒步鞋，适合各种地形',
                features: [
                    '防滑大底',
                    '防水透气',
                    '减震设计',
                    '防撞鞋头'
                ],
                specifications: {
                    '防水等级': 'IPX4',
                    '材质': '皮革+网布',
                    '重量': '0.8kg/双',
                    '适用地形': '山地/丛林'
                }
            }
        ]
    },
    water: {
        name: '水上运动',
        subcategories: {
            kayaking: '皮划艇',
            swimming: '游泳',
            surfing: '冲浪',
            diving: '潜水'
        },
        products: [
            {
                id: 'kayak-001',
                name: '休闲皮划艇',
                price: 1999,
                originalPrice: 2499,
                image: '../img/products/kayak-001.jpg',
                subcategory: 'kayaking',
                description: '轻量化休闲皮划艇，适合湖泊和河流',
                features: [
                    '轻量化设计',
                    '稳定性能',
                    '储物空间',
                    '舒适座椅'
                ],
                specifications: {
                    '长度': '3.2m',
                    '宽度': '0.8m',
                    '重量': '15kg',
                    '承重': '120kg'
                }
            }
        ]
    },
    winter: {
        name: '冬季装备',
        subcategories: {
            skiing: '滑雪',
            snowboarding: '单板',
            ice: '冰上运动',
            accessories: '配件'
        },
        products: [
            {
                id: 'ski-001',
                name: '专业滑雪板',
                price: 2999,
                originalPrice: 3999,
                image: '../img/products/ski-001.jpg',
                subcategory: 'skiing',
                description: '高性能专业滑雪板，适合中级滑雪者',
                features: [
                    '碳纤维结构',
                    '防滑涂层',
                    '减震设计',
                    '快速固定器'
                ],
                specifications: {
                    '长度': '170cm',
                    '宽度': '80mm',
                    '重量': '2.5kg/副',
                    '适用地形': '机压雪道'
                }
            }
        ]
    },
    electronics: {
        name: '电子装备',
        subcategories: {
            navigation: '导航',
            communication: '通讯',
            lighting: '照明',
            power: '电源'
        },
        products: [
            {
                id: 'gps-001',
                name: '户外GPS导航仪',
                price: 1499,
                originalPrice: 1999,
                image: '../img/products/gps-001.jpg',
                subcategory: 'navigation',
                description: '专业户外GPS导航仪，支持离线地图',
                features: [
                    '离线地图',
                    '长续航',
                    '防水防摔',
                    '轨迹记录'
                ],
                specifications: {
                    '屏幕尺寸': '3.5英寸',
                    '电池续航': '20小时',
                    '防水等级': 'IPX7',
                    '重量': '0.3kg'
                }
            }
        ]
    },
    accessories: {
        name: '配件装备',
        subcategories: {
            safety: '安全装备',
            tools: '工具',
            hygiene: '卫生用品',
            storage: '收纳装备'
        },
        products: [
            {
                id: 'safety-001',
                name: '户外急救包',
                price: 199,
                originalPrice: 299,
                image: '../img/products/safety-001.jpg',
                subcategory: 'safety',
                description: '便携式户外急救包，包含常用医疗用品',
                features: [
                    '防水设计',
                    '分类收纳',
                    '便携轻量',
                    '急救指南'
                ],
                specifications: {
                    '尺寸': '20x15x5cm',
                    '重量': '0.5kg',
                    '防水等级': 'IPX4',
                    '适用人数': '2-4人'
                }
            }
        ]
    }
}; 