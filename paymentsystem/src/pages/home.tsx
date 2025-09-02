import React, { useState,useRef } from 'react';
import { Button, DatePicker, Input, Select, Card, Rate, Tag, Row, Col } from 'antd';
import { SearchOutlined, CalendarOutlined, UserOutlined, EnvironmentOutlined,UpOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
const { RangePicker } = DatePicker;
const { Option } = Select;

const searchOptions = [
  { key: 'accommodation', label: 'ที่พัก', icon: '🏨' },
  { key: 'attractions', label: 'สถานที่ท่องเที่ยว', icon: '🗺️' },
  { key: 'activities', label: 'กิจกรรม', icon: '🎉' },
  { key: 'packages', label: 'แพ็คเก็จทัวร์', icon: '✈️' },
];

// ----------------- Placeholder Components -----------------
const DestinationCardPlaceholder = () => (
  <Card
    hoverable
    style={{
      borderRadius: '12px',
      height: '150px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f0f0f0',
    }}
  >
    <span style={{ color: '#999' }}>รอข้อมูลจากฐานข้อมูล...</span>
  </Card>
);

const PromoCardPlaceholder = () => (
  <Card
    hoverable
    style={{
      borderRadius: '12px',
      height: '180px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f0f0f0',
    }}
  >
    <span style={{ color: '#999' }}>รอข้อมูลโปรโมชั่น...</span>
  </Card>
);

const RecommendedCardPlaceholder = () => (
  <Card
    hoverable
    style={{
      borderRadius: '12px',
      height: '220px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f0f0f0',
    }}
  >
    <span style={{ color: '#999' }}>รอข้อมูลแพ็คเกจ...</span>
  </Card>
);

// ----------------- Reusable Components -----------------
const TabItem = ({ option, selectedOption, setSelectedOption }: any) => {
  const isSelected = selectedOption.key === option.key;
  return (
    <div
      onClick={() => setSelectedOption(option)}
      style={{
        padding: '8px 16px',
        cursor: 'pointer',
        fontWeight: isSelected ? 'bold' : 'normal',
        color: isSelected ? '#0066cc' : '#333',
        borderRadius: '25px',
        backgroundColor: isSelected ? '#e6f3ff' : 'transparent',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        transition: 'all 0.3s ease',
        flexShrink: 0,
      }}
      onMouseEnter={(e) => {
        if (!isSelected) e.currentTarget.style.backgroundColor = '#f5f5f5';
      }}
      onMouseLeave={(e) => {
        if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      <span style={{ fontSize: '18px' }}>{option.icon}</span>
      <span style={{ fontSize: '14px' }}>{option.label}</span>
    </div>
  );
};

// ----------------- Main Component -----------------
const Home = () => {
  const [selectedOption, setSelectedOption] = useState(searchOptions[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState<any>(null);
  const [guests, setGuests] = useState(2);
  const [rooms, setRooms] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);


  const handleSearch = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      console.log({ type: selectedOption.key, query: searchQuery, dateRange, guests, rooms });
    }, 1000);
  };

  const getSearchPlaceholder = () => {
    switch (selectedOption.key) {
      case 'accommodation':
        return 'กรุงเทพ, เชียงใหม่, ภูเก็ต...';
      case 'attractions':
        return 'กรอกชื่อสถานที่ท่องเที่ยว...';
      case 'activities':
        return 'ค้นหากิจกรรม...';
      case 'packages':
        return 'ค้นหาแพ็คเก็จทัวร์...';
      default:
        return 'ค้นหา...';
    }
  };

  React.useEffect(() => {
  const handleScroll = () => {
    setShowScrollTop(window.scrollY > 300); // show button after scrolling 300px
  };
  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, []);

const scrollToTop = () => {
  const scrollDuration = 500; // duration in ms
  const start = window.scrollY;
  let startTime: number | null = null;

  const animateScroll = (currentTime: number) => {
    if (!startTime) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const progress = Math.min(timeElapsed / scrollDuration, 1);

    // easeInOutCubic for smooth acceleration/deceleration
    const ease = progress < 0.5
      ? 4 * progress * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 3) / 2;

    window.scrollTo(0, start * (1 - ease));

    if (progress < 1) {
      requestAnimationFrame(animateScroll);
    }
  };

  requestAnimationFrame(animateScroll);
};



  return (
    <div style={{ position: 'relative', minHeight: '100vh', backgroundColor: '#f8f9fa', overflowX: 'hidden' }}>
      {/* Hero Section */}
      <div
        style={{
          backgroundImage:
            'linear-gradient(135deg, rgba(0,102,204,0.8), rgba(51,51,51,0.6)), url(https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&h=600&fit=crop)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          height: '70vh',
          width: '100%',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ textAlign: 'center', color: '#fff', zIndex: 2, padding: '0 16px', maxWidth: '800px' }}>
          <h1
            style={{
              fontSize: 'clamp(2rem, 4vw, 3.5rem)',
              marginBottom: '1rem',
              fontWeight: '700',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
              lineHeight: 1.2,
            }}
          >
            ท่องโลกทั้งใบในราคาถูกลง
          </h1>
          <p
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.4rem)',
              textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
              marginBottom: '2rem',
              opacity: 0.95,
            }}
          >
            จองที่พักและทริปง่าย ๆ กับเรา รับประสบการณ์ท่องเที่ยวที่ไม่เหมือนใคร
          </p>
          <Button
            type="primary"
            size="large"
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: '2px solid white',
              color: 'white',
              backdropFilter: 'blur(10px)',
              fontWeight: 'bold',
              height: '50px',
              padding: '0 30px',
            }}
            onClick={() => document.getElementById('search-section')?.scrollIntoView({ behavior: 'smooth' })}
          >
            เริ่มค้นหา
          </Button>
        </div>
      </div>

      {/* Search Section */}
      <div
        id="search-section"
        style={{
          maxWidth: '900px',
          margin: '0 auto',
          marginTop: '-80px',
          backgroundColor: '#fff',
          padding: '32px',
          borderRadius: '16px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          position: 'relative',
          zIndex: 2,
          marginBottom: '60px',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-32px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#fff',
            padding: '16px 32px',
            borderRadius: '50px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
            display: 'flex',
            gap: '32px',
            justifyContent: 'center',
            zIndex: 5,
            maxWidth: '90%',
            whiteSpace: 'nowrap',
            overflowX: 'auto',
            border: '1px solid #f0f0f0',
          }}
        >
          {searchOptions.map((option) => (
            <TabItem key={option.key} option={option} selectedOption={selectedOption} setSelectedOption={setSelectedOption} />
          ))}
        </div>

        <div style={{ marginTop: '40px' }}>
          <Input
            size="large"
            placeholder={getSearchPlaceholder()}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            prefix={<SearchOutlined style={{ color: '#0066cc' }} />}
            style={{ marginBottom: '20px', borderRadius: '8px', fontSize: '16px' }}
          />
          <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
            <Col xs={24} md={12}>
              <RangePicker
                size="large"
                style={{ width: '100%', borderRadius: '8px' }}
                placeholder={['วันเข้าพัก', 'วันออกเข้าพัก']}
                value={dateRange}
                onChange={setDateRange}
                suffixIcon={<CalendarOutlined style={{ color: '#0066cc' }} />}
                disabledDate={(current) => current && current < dayjs().startOf('day')}
              />
            </Col>
            <Col xs={12} md={6}>
              <Select
                size="large"
                value={guests}
                onChange={setGuests}
                style={{ width: '100%' }}
                suffixIcon={<UserOutlined style={{ color: '#0066cc' }} />}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                  <Option key={num} value={num}>
                    {num} ผู้เข้าพัก
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={12} md={6}>
              <Select size="large" value={rooms} onChange={setRooms} style={{ width: '100%' }}>
                {[1, 2, 3, 4, 5].map((num) => (
                  <Option key={num} value={num}>
                    {num} ห้อง
                  </Option>
                ))}
              </Select>
            </Col>
          </Row>
          <Button
            type="primary"
            size="large"
            loading={isLoading}
            onClick={handleSearch}
            icon={<SearchOutlined />}
            style={{
              width: '100%',
              height: '50px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #0066cc, #004499)',
              border: 'none',
              fontWeight: 'bold',
              fontSize: '16px',
              boxShadow: '0 4px 15px rgba(0,102,204,0.3)',
            }}
          >
            {isLoading ? 'กำลังค้นหา...' : 'ค้นหา'}
          </Button>
        </div>
      </div>

      {/* Sections with placeholders */}
      <Section title="ที่พัก" viewAllLink="/hotels">
  {[...Array(10)].map((_, i) => (
    <DestinationCardPlaceholder key={i}/>
  ))}
</Section>

<Section title="สถานที่ท่องเที่ยว" viewAllLink="/travel">
  {[...Array(10)].map((_, i) => (
    <PromoCardPlaceholder key={i} />
  ))}
</Section>

<Section title="กิจกรรม" viewAllLink="/activities">
  {[...Array(10)].map((_, i) => (
    <PromoCardPlaceholder key={i} />
  ))}
</Section>

<Section title="แพ็คเก็จทัวร์" viewAllLink="/packages">
  {[...Array(10)].map((_, i) => (
    <RecommendedCardPlaceholder key={i}/>
  ))}
</Section>

{/* Scroll to Top Button */}
<Button
  type="primary"
  shape="circle"
  icon={<UpOutlined />}
  onClick={scrollToTop}
  style={{
    position: 'fixed',
    bottom: 32,
    right: 32,
    zIndex: 100,
    width: '48px',
    height: '48px',
    fontSize: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
    transition: 'all 0.4s ease',
    opacity: showScrollTop ? 1 : 0,
    transform: showScrollTop ? 'translateY(0)' : 'translateY(20px)',
    pointerEvents: showScrollTop ? 'auto' : 'none', // prevent clicking when hidden
  }}

  />

    </div>
  );
};

// Generic Section Wrapper
const Section = ({ title, children, viewAllLink }: any) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardWidth = 220 + 16; // card width + gap

  const totalCards = React.Children.count(children);

  const scrollLeft = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  const scrollRight = () => {
    if (!containerRef.current) return;
    const containerWidth = containerRef.current.offsetWidth;
    const visibleCards = Math.floor(containerWidth / cardWidth);
    setCurrentIndex((prev) => Math.min(prev + 1, totalCards - visibleCards));
  };

  // Determine if buttons should be visible
  const containerWidth = containerRef.current?.offsetWidth || 0;
  const visibleCards = Math.floor(containerWidth / cardWidth);
  const showLeft = currentIndex > 0;
  const showRight = currentIndex < totalCards - visibleCards;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px', marginBottom: '60px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#333' }}>{title}</h2>
        {viewAllLink && (
          <Button type="link" href={viewAllLink} style={{ fontSize: '14px', fontWeight: 'bold' }}>
            ดูทั้งหมด
          </Button>
        )}
      </div>

      {/* Card container */}
      <div style={{ position: 'relative', overflow: 'hidden' }} ref={containerRef}>
        {/* Left Button */}
        {showLeft && (
          <Button
            type="text"
            icon={<LeftOutlined />}
            onClick={scrollLeft}
            style={{
              position: 'absolute',
              left: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 10,
              backgroundColor: 'rgba(255,255,255,0.7)',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
            }}
          />
        )}

        {/* Right Button */}
        {showRight && (
          <Button
            type="text"
            icon={<RightOutlined />}
            onClick={scrollRight}
            style={{
              position: 'absolute',
              right: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 10,
              backgroundColor: 'rgba(255,255,255,0.7)',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
            }}
          />
        )}

        <div
          style={{
            display: 'flex',
            gap: '16px',
            transform: `translateX(-${currentIndex * cardWidth}px)`,
            transition: 'transform 0.5s ease',
          }}
        >
          {React.Children.map(children, (child) => (
            <div style={{ flex: '0 0 auto', width: '220px' }}>{child}</div>
          ))}
        </div>
      </div>
    </div>
  );
};








export default Home;
