import Image from "next/image";

export default function Loading() {
  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh',
      width: '100vw',
      backgroundColor: 'var(--background)',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 9999
    }}>
      <div className="pulsate" style={{ textAlign: 'center' }}>
        <Image 
          src="/logo_brand_v1.png" 
          alt="AMLTAB Loader" 
          width={80} 
          height={80} 
          priority
        />
      </div>
    </div>
  );
}
