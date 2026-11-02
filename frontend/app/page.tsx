import ExplodedHero from "@/components/ExplodedHero";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#050505] text-white selection:bg-red-500 selection:text-white">
      {/* 3D Exploded Hero Section */}
      <ExplodedHero />

      {/* Signature Menu Section (Futuristic Dark Theme) */}
      <section className="py-24 px-6 md:px-16 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-4">
          <div>
            <p className="text-red-500 font-mono tracking-widest text-sm">02. SELECTION</p>
            <h2 className="text-4xl font-extrabold mt-1 tracking-tight">Featured Signature Dishes</h2>
          </div>
          <button className="px-6 py-3 border border-white/20 rounded-full hover:bg-white hover:text-black transition text-sm font-mono tracking-wider">
            EXPLORE FULL MENU →
          </button>
        </div>

        {/* Menu Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { 
              name: "The Truffle Smash", 
              price: "₹450", 
              tag: "Best Seller", 
              desc: "Double smashed patties, melted cheddar, truffle aioli, brioche base." 
            },
            { 
              name: "Crispy Golden Fries", 
              price: "₹180", 
              tag: "Side", 
              desc: "Hand-cut potatoes tossed in signature house seasoning." 
            },
            { 
              name: "Artisan Brioche Stack", 
              price: "₹520", 
              tag: "Chef's Special", 
              desc: "Toasted brioche, crisp pickles, secret sauce, premium beef." 
            },
          ].map((dish, i) => (
            <div 
              key={i} 
              className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 hover:border-red-500/50 transition duration-300 group"
            >
              <div className="flex justify-between items-start mb-6">
                <span className="text-xs font-mono px-3 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                  {dish.tag}
                </span>
                <span className="font-mono font-bold text-xl text-white">{dish.price}</span>
              </div>
              <h3 className="text-2xl font-bold mb-3 group-hover:text-red-400 transition">{dish.name}</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-8">{dish.desc}</p>
              <button className="w-full py-4 rounded-xl bg-white/10 text-white font-semibold hover:bg-red-600 hover:text-white transition duration-200 font-mono text-sm">
                + ADD TO ORDER
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 text-center text-gray-500 font-mono text-xs">
        <p>AI RESTAURANT DEMO // POWERED BY NEXT.JS & FASTAPI</p>
      </footer>
    </main>
  );
}