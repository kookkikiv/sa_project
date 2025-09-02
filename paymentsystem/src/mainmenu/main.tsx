// main.tsx (AgodaHeader)
import React, { useState, useRef, useEffect } from 'react';
import { Layout, Button, Typography, Drawer, Dropdown } from 'antd';
import { EllipsisOutlined, MenuOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import Login from '../logins/login.tsx';
import Register from '../register/register.tsx';

const { Header } = Layout;
const { Text } = Typography;

interface Tab {
  key: string;
  label: string;
  path: string;
}

interface AgodaHeaderProps {
  setUseDemoHeader: (val: boolean) => void;
}

const AgodaHeader: React.FC<AgodaHeaderProps> = ({ setUseDemoHeader }) => {
  const [loginVisible, setLoginVisible] = useState(false);
  const [registerVisible, setRegisterVisible] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const tabs: Tab[] = [
    { key: 'hotels', label: 'ที่พัก', path: '/hotels' },
    { key: 'travel', label: 'สถานที่ท่องเที่ยว', path: '/travel' },
    { key: 'activities', label: 'กิจกรรม', path: '/activities' },
    { key: 'package', label: 'แพ็คเก็จทัวร์', path: '/packages' },
  ];

  const tabRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [underlineStyle, setUnderlineStyle] = useState<{ width: number; left: number } | null>(null);
  const currentPath = window.location.pathname;
  const selectedTab = tabs.find(tab => currentPath.startsWith(tab.path))?.key || '';

  useEffect(() => {
    if (!selectedTab) { setUnderlineStyle(null); return; }
    const el = tabRefs.current[selectedTab];
    if (!el) return;
    requestAnimationFrame(() => setUnderlineStyle({ width: el.offsetWidth, left: el.offsetLeft }));
  }, [selectedTab]);

  const handleFullReloadNavigate = (path: string) => {
    window.location.href = path;
  };

  const switchToDemo = () => {
    localStorage.setItem('useDemoHeader', 'true');
    window.location.reload();
  };

  return (
    <>
      <Header style={{ background: '#fff', padding: '0 24px', borderBottom: '1px solid #e8e8e8', height: 64 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%' }}>
          {/* Left */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Button type="text" icon={<MenuOutlined />} onClick={() => setDrawerOpen(true)} style={{ fontSize: 20, marginRight: 16 }} />
            <div style={{ display: 'flex', alignItems: 'center', marginRight: 40, cursor: 'pointer' }} onClick={() => handleFullReloadNavigate('/home')}>
              <span style={{ fontSize: 24, fontWeight: 'bold', color: '#333', marginRight: 8 }}>THAITOUR</span>
            </div>

            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', marginRight: 20 }}>
              {tabs.map(tab => (
                <div key={tab.key} ref={el => { tabRefs.current[tab.key] = el; }} onClick={() => handleFullReloadNavigate(tab.path)}
                  style={{
                    marginRight: 24,
                    padding: '8px 0',
                    cursor: 'pointer',
                    fontWeight: selectedTab === tab.key ? 'bold' : 'normal',
                    fontSize: 14,
                    color: selectedTab === tab.key ? '#0066cc' : '#333',
                    transition: 'color 0.2s, font-weight 0.2s',
                  }}>
                  {tab.label}
                </div>
              ))}
              {underlineStyle && (
                <div style={{ position: 'absolute', bottom: 0, height: 2, background: '#0066cc', width: underlineStyle.width, left: underlineStyle.left, transition: 'left 0.3s ease, width 0.3s ease' }} />
              )}
            </div>

            <Dropdown menu={{ items: [{ key: '1', label: 'สมัครไกด์', onClick: () => handleFullReloadNavigate('/guideapplication') }] }} trigger={['click']}>
              <Button type="text" icon={<EllipsisOutlined style={{ fontSize: 18 }} />} />
            </Dropdown>
          </div>

          {/* Right */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Button type="text" icon={<ShoppingCartOutlined style={{ fontSize: 20, color: '#0066cc' }} />} style={{ marginRight: 16 }} />
            <Button type="text" style={{ display: 'flex', alignItems: 'center', marginRight: 16, padding: '4px 8px' }}>
              <span style={{ fontSize: 16 }}>🇹🇭</span>
            </Button>
            <Button type="text" style={{ marginRight: 16, padding: '4px 8px' }}>
              <Text style={{ fontSize: 14, fontWeight: 'bold' }}>฿</Text>
            </Button>
            <Button type="text" style={{ marginRight: 12, color: '#0066cc', fontWeight: 'bold' }} onClick={() => setLoginVisible(true)}>เข้าสู่ระบบ</Button>
            <Button type="text" style={{ color: '#0066cc', fontWeight: 'bold', marginRight: 16 }} onClick={() => setRegisterVisible(true)}>สร้างบัญชีผู้ใช้</Button>
          </div>
        </div>
      </Header>

      <Drawer title="Menu" placement="left" onClose={() => setDrawerOpen(false)} open={drawerOpen}>
        {tabs.map(tab => (
          <div key={tab.key} onClick={() => { handleFullReloadNavigate(tab.path); setDrawerOpen(false); }} 
            style={{ padding: '12px 0', fontWeight: selectedTab === tab.key ? 'bold' : 'normal', color: selectedTab === tab.key ? '#0066cc' : '#333', cursor: 'pointer' }}>
            {tab.label}
          </div>
        ))}
        <div onClick={() => { handleFullReloadNavigate('/guideapplication'); setDrawerOpen(false); }}
          style={{ padding: '12px 0', fontWeight: 'bold', cursor: 'pointer', color: '#333' }}>สมัครไกด์</div>

        {/* Demo User at bottom */}
        <div onClick={switchToDemo} style={{ padding: '12px 0', fontWeight: 'bold', cursor: 'pointer', color: '#0066cc', borderTop: '1px solid #e8e8e8', marginTop: 16 }}>
          Demo User
        </div>
      </Drawer>

      <Login visible={loginVisible} onClose={() => setLoginVisible(false)} />
      <Register visible={registerVisible} onClose={() => setRegisterVisible(false)} />
    </>
  );
};

export default AgodaHeader;
