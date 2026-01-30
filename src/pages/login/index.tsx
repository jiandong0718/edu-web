import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined, SafetyOutlined } from '@ant-design/icons';
import { login } from '@/api/auth';
import { useUserStore } from '@/stores';

interface LoginFormValues {
  username: string;
  password: string;
}

// 粒子动画背景组件
const ParticleBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let particles: Particle[] = [];
    let mouseX = 0;
    let mouseY = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
      color: string;

      constructor() {
        this.x = Math.random() * canvas!.width;
        this.y = Math.random() * canvas!.height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.size = Math.random() * 2 + 1;
        this.opacity = Math.random() * 0.5 + 0.2;
        this.color = Math.random() > 0.5 ? '#00d4ff' : '#0099ff';
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        // 鼠标交互
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          this.x -= dx * 0.02;
          this.y -= dy * 0.02;
        }

        // 边界检测
        if (this.x < 0 || this.x > canvas!.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas!.height) this.vy *= -1;
      }

      draw() {
        ctx!.beginPath();
        ctx!.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx!.fillStyle = this.color;
        ctx!.globalAlpha = this.opacity;
        ctx!.fill();
        ctx!.globalAlpha = 1;
      }
    }

    const init = () => {
      particles = [];
      const particleCount = Math.floor((canvas.width * canvas.height) / 10000);
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    };

    const drawConnections = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 120) {
            ctx!.beginPath();
            ctx!.moveTo(particles[i].x, particles[i].y);
            ctx!.lineTo(particles[j].x, particles[j].y);
            ctx!.strokeStyle = `rgba(0, 212, 255, ${0.15 * (1 - dist / 120)})`;
            ctx!.lineWidth = 0.5;
            ctx!.stroke();
          }
        }
      }
    };

    const animate = () => {
      ctx!.clearRect(0, 0, canvas.width, canvas.height);

      // 绘制渐变背景
      const gradient = ctx!.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        0,
        canvas.width / 2,
        canvas.height / 2,
        canvas.width / 2
      );
      gradient.addColorStop(0, '#0f1a2e');
      gradient.addColorStop(1, '#0a0e17');
      ctx!.fillStyle = gradient;
      ctx!.fillRect(0, 0, canvas.width, canvas.height);

      // 更新和绘制粒子
      particles.forEach((p) => {
        p.update();
        p.draw();
      });

      drawConnections();

      // 绘制光晕效果
      const glowGradient = ctx!.createRadialGradient(
        canvas.width / 2,
        canvas.height / 3,
        0,
        canvas.width / 2,
        canvas.height / 3,
        300
      );
      glowGradient.addColorStop(0, 'rgba(0, 212, 255, 0.1)');
      glowGradient.addColorStop(1, 'transparent');
      ctx!.fillStyle = glowGradient;
      ctx!.fillRect(0, 0, canvas.width, canvas.height);

      animationId = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    resize();
    init();
    animate();

    window.addEventListener('resize', () => {
      resize();
      init();
    });
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
      }}
    />
  );
};

// 样式定义
const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative' as const,
    overflow: 'hidden',
  },
  loginCard: {
    width: 420,
    padding: '48px 40px',
    background: 'rgba(17, 24, 39, 0.85)',
    backdropFilter: 'blur(20px)',
    borderRadius: 16,
    border: '1px solid rgba(0, 212, 255, 0.2)',
    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5), 0 0 100px rgba(0, 212, 255, 0.1)',
    position: 'relative' as const,
    zIndex: 10,
    animation: 'cardFloat 0.6s ease-out',
  },
  logoContainer: {
    textAlign: 'center' as const,
    marginBottom: 40,
  },
  logoIcon: {
    width: 80,
    height: 80,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.2) 0%, rgba(0, 153, 255, 0.2) 100%)',
    border: '2px solid rgba(0, 212, 255, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
    boxShadow: '0 0 30px rgba(0, 212, 255, 0.3)',
    animation: 'pulse 2s ease-in-out infinite',
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    margin: 0,
    background: 'linear-gradient(135deg, #00d4ff 0%, #0099ff 50%, #00d4ff 100%)',
    backgroundSize: '200% 200%',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    animation: 'gradientShift 3s ease infinite',
    letterSpacing: '2px',
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 8,
    fontSize: 14,
    letterSpacing: '1px',
  },
  input: {
    height: 50,
    background: 'rgba(26, 35, 50, 0.8)',
    border: '1px solid rgba(0, 212, 255, 0.2)',
    borderRadius: 10,
    fontSize: 15,
  },
  button: {
    height: 50,
    fontSize: 16,
    fontWeight: 600,
    borderRadius: 10,
    background: 'linear-gradient(135deg, #00d4ff 0%, #0099ff 100%)',
    border: 'none',
    boxShadow: '0 4px 20px rgba(0, 212, 255, 0.4)',
    transition: 'all 0.3s ease',
  },
  footer: {
    textAlign: 'center' as const,
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 12,
    marginTop: 24,
  },
  decorLine: {
    position: 'absolute' as const,
    width: '100%',
    height: 2,
    background: 'linear-gradient(90deg, transparent, #00d4ff, transparent)',
    top: 0,
    left: 0,
    borderRadius: '16px 16px 0 0',
  },
};

// 全局样式
const globalStyles = `
  @keyframes cardFloat {
    from {
      opacity: 0;
      transform: translateY(30px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @keyframes gradientShift {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }

  @keyframes pulse {
    0%, 100% {
      box-shadow: 0 0 30px rgba(0, 212, 255, 0.3);
    }
    50% {
      box-shadow: 0 0 50px rgba(0, 212, 255, 0.5);
    }
  }

  .login-form .ant-input-affix-wrapper {
    background: rgba(26, 35, 50, 0.8) !important;
    border: 1px solid rgba(0, 212, 255, 0.2) !important;
    border-radius: 10px !important;
    height: 50px !important;
    transition: all 0.3s ease !important;
  }

  .login-form .ant-input-affix-wrapper:hover,
  .login-form .ant-input-affix-wrapper:focus,
  .login-form .ant-input-affix-wrapper-focused {
    border-color: #00d4ff !important;
    box-shadow: 0 0 15px rgba(0, 212, 255, 0.2) !important;
  }

  .login-form .ant-input {
    background: transparent !important;
    color: rgba(255, 255, 255, 0.9) !important;
    font-size: 15px !important;
  }

  .login-form .ant-input::placeholder {
    color: rgba(255, 255, 255, 0.4) !important;
  }

  .login-form .ant-input-prefix {
    color: rgba(0, 212, 255, 0.6) !important;
    margin-right: 12px !important;
  }

  .login-form .ant-btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 25px rgba(0, 212, 255, 0.5) !important;
  }

  .login-form .ant-btn-primary:active {
    transform: translateY(0);
  }

  .login-form .ant-form-item {
    margin-bottom: 24px;
  }
`;

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { setToken, setUserInfo } = useUserStore();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 注入全局样式
    const styleEl = document.createElement('style');
    styleEl.textContent = globalStyles;
    document.head.appendChild(styleEl);
    return () => {
      document.head.removeChild(styleEl);
    };
  }, []);

  const onFinish = async (values: LoginFormValues) => {
    setLoading(true);
    try {
      const result = await login(values);
      setToken(result.token);
      setUserInfo(result.userInfo);
      message.success('登录成功');
      navigate('/');
    } catch (error) {
      // 错误已在 request 拦截器中处理
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <ParticleBackground />

      <div style={styles.loginCard}>
        {/* 顶部装饰线 */}
        <div style={styles.decorLine} />

        <div style={styles.logoContainer}>
          <div style={styles.logoIcon}>
            <SafetyOutlined style={{ fontSize: 36, color: '#00d4ff' }} />
          </div>
          <h1 style={styles.title}>EDU ADMIN</h1>
          <p style={styles.subtitle}>Education Management System</p>
        </div>

        <Form
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          size="large"
          className="login-form"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="用户名"
              style={styles.input}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
              style={styles.input}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 16 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              style={styles.button}
            >
              {loading ? '登录中...' : '登 录'}
            </Button>
          </Form.Item>
        </Form>

        <div style={styles.footer}>
          <p>默认账号: admin / admin123</p>
          <p style={{ marginTop: 8, opacity: 0.6 }}>
            Powered by React + Ant Design
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
