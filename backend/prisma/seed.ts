import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const fashionItems = [
  // Nike Items
  { name: 'Air Force 1 Low', brand: 'Nike', price: 110, tags: ['sneakers', 'casual', 'white', 'classic'], gender: 'unisex', season: 'all' },
  { name: 'Air Max 90', brand: 'Nike', price: 120, tags: ['sneakers', 'retro', 'colorful', 'athletic'], gender: 'unisex', season: 'all' },
  { name: 'Dunk Low', brand: 'Nike', price: 100, tags: ['sneakers', 'skate', 'vintage', 'streetwear'], gender: 'unisex', season: 'all' },
  { name: 'Tech Fleece Hoodie', brand: 'Nike', price: 90, tags: ['hoodie', 'athleisure', 'minimalist', 'casual'], gender: 'unisex', season: 'fall' },
  { name: 'Swoosh Windbreaker', brand: 'Nike', price: 75, tags: ['jacket', 'athletic', 'lightweight', 'sporty'], gender: 'unisex', season: 'spring' },

  // Adidas Items
  { name: 'Stan Smith', brand: 'Adidas', price: 85, tags: ['sneakers', 'tennis', 'white', 'minimalist'], gender: 'unisex', season: 'all' },
  { name: 'Ultraboost 22', brand: 'Adidas', price: 180, tags: ['sneakers', 'running', 'performance', 'comfortable'], gender: 'unisex', season: 'all' },
  { name: 'Gazelle', brand: 'Adidas', price: 80, tags: ['sneakers', 'retro', 'suede', 'casual'], gender: 'unisex', season: 'all' },
  { name: 'Three Stripes Track Jacket', brand: 'Adidas', price: 70, tags: ['jacket', 'athletic', 'retro', 'sporty'], gender: 'unisex', season: 'spring' },
  { name: 'Adicolor Hoodie', brand: 'Adidas', price: 65, tags: ['hoodie', 'casual', 'colorful', 'athleisure'], gender: 'unisex', season: 'fall' },

  // Levi's Items
  { name: '501 Original Jeans', brand: "Levi's", price: 98, tags: ['jeans', 'denim', 'classic', 'vintage'], gender: 'unisex', season: 'all' },
  { name: 'Trucker Jacket', brand: "Levi's", price: 89, tags: ['jacket', 'denim', 'vintage', 'casual'], gender: 'unisex', season: 'spring' },
  { name: '511 Slim Jeans', brand: "Levi's", price: 79, tags: ['jeans', 'slim', 'modern', 'versatile'], gender: 'unisex', season: 'all' },
  { name: 'Sherpa Trucker Jacket', brand: "Levi's", price: 128, tags: ['jacket', 'denim', 'lined', 'warm'], gender: 'unisex', season: 'winter' },
  { name: 'Vintage Tee', brand: "Levi's", price: 29, tags: ['tshirt', 'vintage', 'casual', 'comfortable'], gender: 'unisex', season: 'summer' },

  // Supreme Items
  { name: 'Box Logo Hoodie', brand: 'Supreme', price: 250, tags: ['hoodie', 'streetwear', 'hype', 'limited'], gender: 'unisex', season: 'fall' },
  { name: 'Script Logo Tee', brand: 'Supreme', price: 85, tags: ['tshirt', 'streetwear', 'casual', 'logo'], gender: 'unisex', season: 'summer' },
  { name: 'Shoulder Bag', brand: 'Supreme', price: 180, tags: ['bag', 'accessory', 'streetwear', 'functional'], gender: 'unisex', season: 'all' },
  { name: 'Canvas Jacket', brand: 'Supreme', price: 320, tags: ['jacket', 'streetwear', 'premium', 'canvas'], gender: 'unisex', season: 'spring' },
  { name: 'Five Panel Cap', brand: 'Supreme', price: 60, tags: ['hat', 'cap', 'streetwear', 'accessory'], gender: 'unisex', season: 'all' },

  // Off-White Items
  { name: 'Industrial Belt', brand: 'Off-White', price: 220, tags: ['belt', 'accessory', 'industrial', 'statement'], gender: 'unisex', season: 'all' },
  { name: 'Diagonal Hoodie', brand: 'Off-White', price: 490, tags: ['hoodie', 'luxury', 'streetwear', 'diagonal'], gender: 'unisex', season: 'fall' },
  { name: 'Caravaggio Tee', brand: 'Off-White', price: 320, tags: ['tshirt', 'art', 'luxury', 'graphic'], gender: 'unisex', season: 'summer' },
  { name: 'Arrows Sweatshirt', brand: 'Off-White', price: 445, tags: ['sweatshirt', 'luxury', 'arrows', 'minimalist'], gender: 'unisex', season: 'fall' },
  { name: 'Quote Backpack', brand: 'Off-White', price: 890, tags: ['backpack', 'luxury', 'quote', 'functional'], gender: 'unisex', season: 'all' },

  // Balenciaga Items
  { name: 'Triple S Sneakers', brand: 'Balenciaga', price: 1090, tags: ['sneakers', 'luxury', 'chunky', 'designer'], gender: 'unisex', season: 'all' },
  { name: 'Speed Trainer', brand: 'Balenciaga', price: 795, tags: ['sneakers', 'luxury', 'sock', 'modern'], gender: 'unisex', season: 'all' },
  { name: 'Everyday Tee', brand: 'Balenciaga', price: 350, tags: ['tshirt', 'luxury', 'oversized', 'minimalist'], gender: 'unisex', season: 'summer' },
  { name: 'Logo Hoodie', brand: 'Balenciaga', price: 850, tags: ['hoodie', 'luxury', 'logo', 'oversized'], gender: 'unisex', season: 'fall' },
  { name: 'Shopping Bag', brand: 'Balenciaga', price: 1790, tags: ['bag', 'luxury', 'leather', 'statement'], gender: 'women', season: 'all' },

  // Gucci Items
  { name: 'Ace Sneakers', brand: 'Gucci', price: 620, tags: ['sneakers', 'luxury', 'bee', 'designer'], gender: 'unisex', season: 'all' },
  { name: 'GG Belt', brand: 'Gucci', price: 450, tags: ['belt', 'luxury', 'logo', 'accessory'], gender: 'unisex', season: 'all' },
  { name: 'Technical Jersey Jacket', brand: 'Gucci', price: 1980, tags: ['jacket', 'luxury', 'technical', 'sporty'], gender: 'unisex', season: 'spring' },
  { name: 'Logo Tee', brand: 'Gucci', price: 590, tags: ['tshirt', 'luxury', 'vintage', 'logo'], gender: 'unisex', season: 'summer' },
  { name: 'Dionysus Bag', brand: 'Gucci', price: 2300, tags: ['bag', 'luxury', 'leather', 'feminine'], gender: 'women', season: 'all' },

  // Stone Island Items
  { name: 'Ghost Piece Hoodie', brand: 'Stone Island', price: 315, tags: ['hoodie', 'technical', 'minimalist', 'modern'], gender: 'men', season: 'fall' },
  { name: 'Compass Badge Tee', brand: 'Stone Island', price: 95, tags: ['tshirt', 'casual', 'logo', 'comfortable'], gender: 'men', season: 'summer' },
  { name: 'Crinkle Reps Jacket', brand: 'Stone Island', price: 595, tags: ['jacket', 'technical', 'innovative', 'functional'], gender: 'men', season: 'spring' },
  { name: 'Cargo Pants', brand: 'Stone Island', price: 245, tags: ['pants', 'cargo', 'functional', 'technical'], gender: 'men', season: 'all' },
  { name: 'Knit Beanie', brand: 'Stone Island', price: 85, tags: ['beanie', 'accessory', 'warm', 'logo'], gender: 'unisex', season: 'winter' },

  // Fear of God Essentials Items
  { name: 'Oversized Hoodie', brand: 'Fear of God Essentials', price: 90, tags: ['hoodie', 'oversized', 'minimalist', 'neutral'], gender: 'unisex', season: 'fall' },
  { name: 'Boxy Tee', brand: 'Fear of God Essentials', price: 50, tags: ['tshirt', 'boxy', 'relaxed', 'comfortable'], gender: 'unisex', season: 'summer' },
  { name: 'Track Pants', brand: 'Fear of God Essentials', price: 80, tags: ['pants', 'track', 'casual', 'comfortable'], gender: 'unisex', season: 'all' },
  { name: 'Polo Shirt', brand: 'Fear of God Essentials', price: 75, tags: ['polo', 'smart-casual', 'minimalist', 'versatile'], gender: 'unisex', season: 'summer' },
  { name: 'Puffer Jacket', brand: 'Fear of God Essentials', price: 220, tags: ['jacket', 'puffer', 'warm', 'oversized'], gender: 'unisex', season: 'winter' },

  // Stussy Items
  { name: 'World Tour Hoodie', brand: 'Stussy', price: 85, tags: ['hoodie', 'streetwear', 'vintage', 'graphic'], gender: 'unisex', season: 'fall' },
  { name: 'Basic Logo Tee', brand: 'Stussy', price: 35, tags: ['tshirt', 'basic', 'logo', 'affordable'], gender: 'unisex', season: 'summer' },
  { name: 'Bucket Hat', brand: 'Stussy', price: 40, tags: ['hat', 'bucket', 'casual', 'retro'], gender: 'unisex', season: 'summer' },
  { name: 'Coach Jacket', brand: 'Stussy', price: 95, tags: ['jacket', 'coach', 'lightweight', 'streetwear'], gender: 'unisex', season: 'spring' },
  { name: 'Cargo Shorts', brand: 'Stussy', price: 65, tags: ['shorts', 'cargo', 'casual', 'functional'], gender: 'men', season: 'summer' },

  // Palace Items
  { name: 'Tri-Ferg Hoodie', brand: 'Palace', price: 110, tags: ['hoodie', 'streetwear', 'logo', 'skateboard'], gender: 'unisex', season: 'fall' },
  { name: 'P-Cap', brand: 'Palace', price: 45, tags: ['cap', 'logo', 'skateboard', 'casual'], gender: 'unisex', season: 'all' },
  { name: 'Multicam Tee', brand: 'Palace', price: 50, tags: ['tshirt', 'camo', 'military', 'streetwear'], gender: 'unisex', season: 'summer' },
  { name: 'Shell Jacket', brand: 'Palace', price: 180, tags: ['jacket', 'shell', 'functional', 'skateboard'], gender: 'unisex', season: 'spring' },
  { name: 'Basically A Tee', brand: 'Palace', price: 45, tags: ['tshirt', 'basic', 'comfortable', 'casual'], gender: 'unisex', season: 'summer' },

  // Golf Wang Items
  { name: 'Flower Boy Hoodie', brand: 'Golf Wang', price: 75, tags: ['hoodie', 'colorful', 'artistic', 'creative'], gender: 'unisex', season: 'fall' },
  { name: 'Golf Logo Tee', brand: 'Golf Wang', price: 40, tags: ['tshirt', 'golf', 'colorful', 'playful'], gender: 'unisex', season: 'summer' },
  { name: 'Flame Shorts', brand: 'Golf Wang', price: 55, tags: ['shorts', 'flame', 'bold', 'artistic'], gender: 'unisex', season: 'summer' },
  { name: 'Cardigan', brand: 'Golf Wang', price: 120, tags: ['cardigan', 'preppy', 'colorful', 'vintage'], gender: 'unisex', season: 'fall' },
  { name: 'Bucket Hat', brand: 'Golf Wang', price: 35, tags: ['hat', 'bucket', 'colorful', 'fun'], gender: 'unisex', season: 'summer' },

  // Anti Social Social Club Items
  { name: 'Mind Games Hoodie', brand: 'Anti Social Social Club', price: 90, tags: ['hoodie', 'mental-health', 'minimalist', 'statement'], gender: 'unisex', season: 'fall' },
  { name: 'Logo Tee', brand: 'Anti Social Social Club', price: 50, tags: ['tshirt', 'logo', 'minimalist', 'statement'], gender: 'unisex', season: 'summer' },
  { name: 'Blocked Hoodie', brand: 'Anti Social Social Club', price: 95, tags: ['hoodie', 'blocked', 'graphic', 'streetwear'], gender: 'unisex', season: 'fall' },
  { name: 'Flannel Shirt', brand: 'Anti Social Social Club', price: 80, tags: ['shirt', 'flannel', 'grunge', 'casual'], gender: 'unisex', season: 'fall' },
  { name: 'Dad Hat', brand: 'Anti Social Social Club', price: 35, tags: ['hat', 'dad-hat', 'minimalist', 'casual'], gender: 'unisex', season: 'all' },

  // Kith Items
  { name: 'Box Logo Hoodie', brand: 'Kith', price: 140, tags: ['hoodie', 'premium', 'minimalist', 'comfortable'], gender: 'unisex', season: 'fall' },
  { name: 'Williams Tee', brand: 'Kith', price: 65, tags: ['tshirt', 'premium', 'soft', 'comfortable'], gender: 'unisex', season: 'summer' },
  { name: 'Madison Jacket', brand: 'Kith', price: 250, tags: ['jacket', 'premium', 'versatile', 'modern'], gender: 'unisex', season: 'spring' },
  { name: 'Mercer Pants', brand: 'Kith', price: 110, tags: ['pants', 'premium', 'comfortable', 'versatile'], gender: 'unisex', season: 'all' },
  { name: 'New Era Cap', brand: 'Kith', price: 50, tags: ['cap', 'collaboration', 'premium', 'sporty'], gender: 'unisex', season: 'all' },

  // Women's Specific Items
  { name: 'Slip Dress', brand: 'Zara', price: 45, tags: ['dress', 'slip', 'elegant', 'minimalist'], gender: 'women', season: 'summer' },
  { name: 'Blazer', brand: 'Zara', price: 79, tags: ['blazer', 'professional', 'structured', 'versatile'], gender: 'women', season: 'all' },
  { name: 'High-Waist Jeans', brand: 'Zara', price: 39, tags: ['jeans', 'high-waist', 'trendy', 'flattering'], gender: 'women', season: 'all' },
  { name: 'Cropped Sweater', brand: 'Zara', price: 35, tags: ['sweater', 'cropped', 'cozy', 'trendy'], gender: 'women', season: 'fall' },
  { name: 'Mini Skirt', brand: 'Zara', price: 25, tags: ['skirt', 'mini', 'versatile', 'trendy'], gender: 'women', season: 'summer' },

  { name: 'Midi Dress', brand: 'H&M', price: 29, tags: ['dress', 'midi', 'affordable', 'versatile'], gender: 'women', season: 'summer' },
  { name: 'Oversized Cardigan', brand: 'H&M', price: 35, tags: ['cardigan', 'oversized', 'cozy', 'layering'], gender: 'women', season: 'fall' },
  { name: 'Wide-Leg Trousers', brand: 'H&M', price: 24, tags: ['pants', 'wide-leg', 'comfortable', 'trendy'], gender: 'women', season: 'all' },
  { name: 'Crop Top', brand: 'H&M', price: 12, tags: ['top', 'crop', 'basic', 'affordable'], gender: 'women', season: 'summer' },
  { name: 'Puffer Vest', brand: 'H&M', price: 39, tags: ['vest', 'puffer', 'layering', 'practical'], gender: 'women', season: 'fall' },

  // Additional Brands and Items
  { name: 'Classic Trench Coat', brand: 'Burberry', price: 1590, tags: ['coat', 'trench', 'luxury', 'timeless'], gender: 'unisex', season: 'spring' },
  { name: 'Polo Shirt', brand: 'Ralph Lauren', price: 89, tags: ['polo', 'preppy', 'classic', 'versatile'], gender: 'unisex', season: 'summer' },
  { name: 'Chuck Taylor All Star', brand: 'Converse', price: 60, tags: ['sneakers', 'canvas', 'classic', 'casual'], gender: 'unisex', season: 'all' },
  { name: 'Old Skool', brand: 'Vans', price: 65, tags: ['sneakers', 'skate', 'retro', 'casual'], gender: 'unisex', season: 'all' },
  { name: '1460 Boots', brand: 'Dr. Martens', price: 170, tags: ['boots', 'leather', 'durable', 'alternative'], gender: 'unisex', season: 'fall' },

  { name: 'Flannel Shirt', brand: 'Pendleton', price: 89, tags: ['shirt', 'flannel', 'warm', 'heritage'], gender: 'unisex', season: 'fall' },
  { name: 'Cashmere Scarf', brand: 'Acne Studios', price: 290, tags: ['scarf', 'cashmere', 'luxury', 'warm'], gender: 'unisex', season: 'winter' },
  { name: 'Leather Jacket', brand: 'Schott', price: 595, tags: ['jacket', 'leather', 'biker', 'classic'], gender: 'unisex', season: 'spring' },
  { name: 'Wool Beanie', brand: 'Carhartt WIP', price: 25, tags: ['beanie', 'wool', 'workwear', 'warm'], gender: 'unisex', season: 'winter' },
  { name: 'Cargo Pants', brand: 'Carhartt WIP', price: 95, tags: ['pants', 'cargo', 'workwear', 'durable'], gender: 'unisex', season: 'all' },

  // More Affordable Options
  { name: 'Basic White Tee', brand: 'Uniqlo', price: 15, tags: ['tshirt', 'basic', 'affordable', 'essential'], gender: 'unisex', season: 'all' },
  { name: 'Heattech Top', brand: 'Uniqlo', price: 20, tags: ['top', 'thermal', 'functional', 'warm'], gender: 'unisex', season: 'winter' },
  { name: 'Ultra Light Down Jacket', brand: 'Uniqlo', price: 70, tags: ['jacket', 'down', 'lightweight', 'packable'], gender: 'unisex', season: 'winter' },
  { name: 'Selvedge Jeans', brand: 'Uniqlo', price: 50, tags: ['jeans', 'selvedge', 'quality', 'affordable'], gender: 'unisex', season: 'all' },
  { name: 'Merino Wool Sweater', brand: 'Uniqlo', price: 40, tags: ['sweater', 'merino', 'soft', 'comfortable'], gender: 'unisex', season: 'fall' },

  // Vintage/Thrift Style Items
  { name: 'Vintage Band Tee', brand: 'Vintage', price: 35, tags: ['tshirt', 'vintage', 'band', 'unique'], gender: 'unisex', season: 'summer' },
  { name: 'Acid Wash Jeans', brand: 'Vintage', price: 45, tags: ['jeans', 'acid-wash', 'retro', 'unique'], gender: 'unisex', season: 'all' },
  { name: 'Varsity Jacket', brand: 'Vintage', price: 85, tags: ['jacket', 'varsity', 'retro', 'sporty'], gender: 'unisex', season: 'fall' },
  { name: 'Corduroy Pants', brand: 'Vintage', price: 40, tags: ['pants', 'corduroy', 'retro', 'textured'], gender: 'unisex', season: 'fall' },
  { name: 'Windbreaker', brand: 'Vintage', price: 30, tags: ['jacket', 'windbreaker', 'retro', 'sporty'], gender: 'unisex', season: 'spring' },

  // Athletic/Sportswear
  { name: 'Dri-FIT Shorts', brand: 'Nike', price: 35, tags: ['shorts', 'athletic', 'performance', 'breathable'], gender: 'unisex', season: 'summer' },
  { name: 'Climalite Tank', brand: 'Adidas', price: 30, tags: ['tank', 'athletic', 'performance', 'moisture-wicking'], gender: 'unisex', season: 'summer' },
  { name: 'Yoga Pants', brand: 'Lululemon', price: 98, tags: ['pants', 'yoga', 'athletic', 'comfortable'], gender: 'women', season: 'all' },
  { name: 'Sports Bra', brand: 'Lululemon', price: 52, tags: ['bra', 'sports', 'athletic', 'supportive'], gender: 'women', season: 'all' },
  { name: 'Running Shorts', brand: 'Patagonia', price: 45, tags: ['shorts', 'running', 'outdoor', 'sustainable'], gender: 'unisex', season: 'summer' },

  // Accessories
  { name: 'Canvas Tote Bag', brand: 'Everlane', price: 38, tags: ['bag', 'tote', 'canvas', 'sustainable'], gender: 'unisex', season: 'all' },
  { name: 'Leather Wallet', brand: 'Bellroy', price: 89, tags: ['wallet', 'leather', 'minimal', 'functional'], gender: 'unisex', season: 'all' },
  { name: 'Sunglasses', brand: 'Ray-Ban', price: 150, tags: ['sunglasses', 'classic', 'protection', 'style'], gender: 'unisex', season: 'summer' },
  { name: 'Watch', brand: 'Casio', price: 45, tags: ['watch', 'digital', 'functional', 'retro'], gender: 'unisex', season: 'all' },
  { name: 'Crossbody Bag', brand: 'Coach', price: 295, tags: ['bag', 'crossbody', 'luxury', 'leather'], gender: 'women', season: 'all' },

  // Formal/Professional
  { name: 'Button-Down Shirt', brand: 'Brooks Brothers', price: 95, tags: ['shirt', 'button-down', 'professional', 'classic'], gender: 'unisex', season: 'all' },
  { name: 'Suit Jacket', brand: 'Hugo Boss', price: 395, tags: ['jacket', 'suit', 'formal', 'professional'], gender: 'men', season: 'all' },
  { name: 'Dress Pants', brand: 'Hugo Boss', price: 180, tags: ['pants', 'dress', 'formal', 'tailored'], gender: 'men', season: 'all' },
  { name: 'Silk Blouse', brand: 'Equipment', price: 188, tags: ['blouse', 'silk', 'elegant', 'professional'], gender: 'women', season: 'all' },
  { name: 'Pencil Skirt', brand: 'Theory', price: 225, tags: ['skirt', 'pencil', 'professional', 'fitted'], gender: 'women', season: 'all' },

  // Loungewear/Comfort
  { name: 'Sweatpants', brand: 'Champion', price: 30, tags: ['pants', 'sweat', 'comfortable', 'loungewear'], gender: 'unisex', season: 'all' },
  { name: 'Fleece Hoodie', brand: 'Champion', price: 45, tags: ['hoodie', 'fleece', 'warm', 'comfortable'], gender: 'unisex', season: 'fall' },
  { name: 'Pajama Set', brand: 'Calvin Klein', price: 65, tags: ['pajamas', 'set', 'comfortable', 'sleepwear'], gender: 'unisex', season: 'all' },
  { name: 'Robe', brand: 'Parachute', price: 89, tags: ['robe', 'cotton', 'comfortable', 'luxurious'], gender: 'unisex', season: 'all' },
  { name: 'Slippers', brand: 'UGG', price: 100, tags: ['slippers', 'sheepskin', 'warm', 'comfortable'], gender: 'unisex', season: 'winter' },

  // Seasonal Specific
  { name: 'Swimsuit', brand: 'Speedo', price: 55, tags: ['swimwear', 'athletic', 'summer', 'functional'], gender: 'women', season: 'summer' },
  { name: 'Board Shorts', brand: 'Patagonia', price: 65, tags: ['shorts', 'swim', 'surf', 'sustainable'], gender: 'men', season: 'summer' },
  { name: 'Snow Boots', brand: 'Sorel', price: 150, tags: ['boots', 'snow', 'warm', 'waterproof'], gender: 'unisex', season: 'winter' },
  { name: 'Rain Jacket', brand: 'Patagonia', price: 179, tags: ['jacket', 'rain', 'waterproof', 'outdoor'], gender: 'unisex', season: 'spring' },
  { name: 'Sun Hat', brand: 'Sunday Afternoons', price: 35, tags: ['hat', 'sun', 'protection', 'outdoor'], gender: 'unisex', season: 'summer' },
];

async function seed() {
  console.log('Starting database seed...');
  
  // Clean the database
  await prisma.vote.deleteMany();
  await prisma.voteSession.deleteMany();
  await prisma.like.deleteMany();
  await prisma.save.deleteMany();
  await prisma.pass.deleteMany();
  await prisma.friendship.deleteMany();
  await prisma.user.deleteMany();
  await prisma.item.deleteMany();

  console.log('Database cleaned');

  // Create test users
  const password = await bcrypt.hash('password123', 10);
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'alice@example.com',
        username: 'alice',
        passwordHash: password,
        bio: 'Fashion enthusiast who loves minimalist and classic pieces',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice',
      },
    }),
    prisma.user.create({
      data: {
        email: 'bob@example.com',
        username: 'bob',
        passwordHash: password,
        bio: 'Streetwear lover and sneaker collector',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob',
      },
    }),
    prisma.user.create({
      data: {
        email: 'carol@example.com',
        username: 'carol',
        passwordHash: password,
        bio: 'Luxury fashion and designer pieces are my passion',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=carol',
      },
    }),
    prisma.user.create({
      data: {
        email: 'david@example.com',
        username: 'david',
        passwordHash: password,
        bio: 'Athleisure and comfortable fashion advocate',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=david',
      },
    }),
  ]);

  console.log(`Created ${users.length} users`);

  // Create items with proper image URLs
  const items = await Promise.all(
    fashionItems.map((item, index) => {
      const imageIndex = (index % 5) + 1;
      const imageUrl = `https://picsum.photos/400/500?random=${index + 1}`;
      
      return prisma.item.create({
        data: {
          ...item,
          images: [imageUrl],
          price: item.price,
          currency: 'USD',
          active: true,
        },
      });
    })
  );

  console.log(`Created ${items.length} fashion items`);

  // Create friendships
  const friendships = [
    { userAId: users[0].id, userBId: users[1].id },
    { userAId: users[0].id, userBId: users[2].id },
    { userAId: users[1].id, userBId: users[3].id },
    { userAId: users[2].id, userBId: users[3].id },
  ];

  for (const friendship of friendships) {
    await prisma.friendship.create({
      data: {
        ...friendship,
        status: 'accepted',
      },
    });
  }

  console.log(`Created ${friendships.length} friendships`);

  // Create realistic interactions based on user preferences
  const interactions = [];

  // Alice (minimalist/classic) likes certain items
  const aliceLikes = items.filter(item => 
    item.tags.some(tag => ['minimalist', 'classic', 'elegant', 'professional', 'luxury'].includes(tag))
  ).slice(0, 25);

  for (const item of aliceLikes) {
    interactions.push(
      prisma.like.create({
        data: { userId: users[0].id, itemId: item.id },
      })
    );
  }

  // Bob (streetwear) likes certain items
  const bobLikes = items.filter(item => 
    item.tags.some(tag => ['streetwear', 'sneakers', 'athletic', 'casual', 'hype'].includes(tag))
  ).slice(0, 30);

  for (const item of bobLikes) {
    interactions.push(
      prisma.like.create({
        data: { userId: users[1].id, itemId: item.id },
      })
    );
  }

  // Carol (luxury) likes certain items
  const carolLikes = items.filter(item => 
    item.tags.some(tag => ['luxury', 'designer', 'premium', 'elegant', 'leather'].includes(tag))
  ).slice(0, 20);

  for (const item of carolLikes) {
    interactions.push(
      prisma.like.create({
        data: { userId: users[2].id, itemId: item.id },
      })
    );
  }

  // David (athleisure) likes certain items
  const davidLikes = items.filter(item => 
    item.tags.some(tag => ['athletic', 'comfortable', 'performance', 'sporty', 'athleisure'].includes(tag))
  ).slice(0, 22);

  for (const item of davidLikes) {
    interactions.push(
      prisma.like.create({
        data: { userId: users[3].id, itemId: item.id },
      })
    );
  }

  // Add some saves and passes
  const someItems = items.slice(0, 20);
  for (let i = 0; i < someItems.length; i++) {
    const item = someItems[i];
    const user = users[i % users.length];
    
    if (i % 3 === 0) {
      interactions.push(
        prisma.save.create({
          data: { userId: user.id, itemId: item.id },
        })
      );
    } else if (i % 4 === 0) {
      interactions.push(
        prisma.pass.create({
          data: { userId: user.id, itemId: item.id },
        })
      );
    }
  }

  await Promise.all(interactions);
  console.log(`Created ${interactions.length} user interactions`);

  // Create a sample vote session
  const voteSession = await prisma.voteSession.create({
    data: {
      hostId: users[0].id,
      code: 'DEMO123',
      itemIds: items.slice(0, 5).map(item => item.id),
    },
  });

  // Add some votes to the session
  const votes = [];
  for (let i = 0; i < 3; i++) {
    for (const itemId of voteSession.itemIds) {
      votes.push(
        prisma.vote.create({
          data: {
            sessionId: voteSession.id,
            userId: users[i].id,
            itemId,
            value: Math.random() > 0.5 ? 1 : 0,
          },
        })
      );
    }
  }

  await Promise.all(votes);
  console.log('Created sample vote session with votes');

  console.log('Database has been seeded successfully!');
  console.log(`
    Summary:
    - ${users.length} users created
    - ${items.length} fashion items created
    - ${friendships.length} friendships created
    - ${interactions.length} user interactions created
    - 1 vote session with votes created
    
    Login credentials:
    - alice@example.com / password123
    - bob@example.com / password123
    - carol@example.com / password123
    - david@example.com / password123
  `);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });