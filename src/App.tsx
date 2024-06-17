import React, { useRef, useState } from "react";
import { UserOutlined } from "@ant-design/icons";
import {
  Button,
  Col,
  Form,
  FormInstance,
  InputNumber,
  Layout,
  Menu,
  Row,
  Select,
  Space,
  theme,
} from "antd";

interface ImgInstance {
  width: number;
  height: number;
  size: number;
  imgType: string;
}
const { Header, Content, Footer, Sider } = Layout;

const items = [
  {
    key: "1",
    icon: <UserOutlined />,
    label: "生成测试图片",
  },
];
const App: React.FC = () => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const [imgSizeType, setImgSizeType] = useState("MB");
  const [previewImageURL, setPreviewImageURL] = useState<string | null>(null);
  const FormItem = Form.Item;
  const formRef = useRef<FormInstance>(null);
  const selectAfter = (
    <Select
      defaultValue="MB"
      style={{ width: 60 }}
      value={imgSizeType}
      onChange={(value: string) => {
        setImgSizeType(value);
      }}
    >
      <Select.Option value="KB">KB</Select.Option>
      <Select.Option value="MB">MB</Select.Option>
    </Select>
  );

  function canvasToBlob(canvas, mimeType) {
    return new Promise((resolve) => {
      canvas.toBlob(resolve, mimeType);
    });
  }
  function convertToBytes(size) {
    if (imgSizeType === "KB") {
      return size * 1024;
    } else if (imgSizeType === "MB") {
      return size * 1024 * 1024;
    } else {
      throw new Error('Unsupported unit. Please use "KB" or "MB".');
    }
  }
  const canvasToImages = (data: ImgInstance) => {
    const { width, height, size, imgType } = data;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "white"; // 或者其他颜色/图案
      ctx.fillRect(0, 0, width, height);
      // 设置字体样式
      ctx.font = "bold 48px Arial"; // 示例：设置字体为Arial，大小为48px，是否加粗等
      ctx.textAlign = "center"; // 文字水平居中
      ctx.textBaseline = "middle"; // 文字垂直居中
      ctx.fillStyle = "black"; // 文字颜色
      const textToDraw = `${width}x${height}`;
      // 计算文本的绘制位置，确保居中
      const x = width / 2;
      const y = height / 2;
      ctx.fillText(textToDraw, x, y);
    }

    const mimeType = `image/${imgType}`;
    const targetSizeInBytes = convertToBytes(size); // 假设sizeUnit是'MB'或'KB'
    canvasToBlob(canvas, mimeType).then((blob) => {
      blob.arrayBuffer().then((buf) => {
        const actualSize = buf.byteLength;
        const paddingSize = targetSizeInBytes - actualSize;

        if (paddingSize > 0) {
          // 如果需要填充，则创建填充数据
          const padding = new ArrayBuffer(paddingSize);
          const longInt8View = new Uint8Array(padding);
          for (let i = 0; i < longInt8View.length; i++) {
            longInt8View[i] = i % 255; // 这里只是示例，实际可以根据需要填充任意数据
          }

          // 步骤 3: 拼接图片数据与填充数据
          const file = new Blob([buf, padding], { type: mimeType });
          //假设file已经是目标大小的Blob
          const url = URL.createObjectURL(file);
          setPreviewImageURL(url);
          // 创建隐藏的可下载链接
          const downloadLink = document.createElement("a");
          downloadLink.href = url;
          downloadLink.download = `image.${imgType}`; // 自定义下载文件名
          downloadLink.style.display = "none";

          document.body.appendChild(downloadLink);
          downloadLink.click();

          // // 清理URL对象
          // URL.revokeObjectURL(url);
          document.body.removeChild(downloadLink);
        } else {
          console.warn(
            "The actual file size is larger than or equal to the target size. No padding needed."
          );
        }
      });
    });
  };
  const onCreateImages = () => {
    formRef.current?.validateFields().then((res) => {
      canvasToImages(res);
    });
  };
  const onClear = () => {
    formRef.current?.resetFields();
    setImgSizeType("MB");
    setPreviewImageURL(null);
  };
  return (
    <Layout>
      <Sider breakpoint="lg" collapsedWidth="0">
        <div className="demo-logo-vertical" />
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={["1"]}
          items={items}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }} />
        <Content style={{ margin: "24px 16px 0" }}>
          <div
            style={{
              padding: 24,
              minHeight: 360,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <h1>create images</h1>
            <Form ref={formRef}>
              <Row gutter={24}>
                <Col span={4}>
                  <FormItem
                    label="width"
                    name={"width"}
                    rules={[{ required: true, message: "请输入宽度" }]}
                  >
                    <InputNumber placeholder="请输入宽度" />
                  </FormItem>
                </Col>
                <Col span={4}>
                  <FormItem
                    label="height"
                    name={"height"}
                    rules={[{ required: true, message: "请输入高度" }]}
                  >
                    <InputNumber placeholder="请输入高度" />
                  </FormItem>
                </Col>
                <Col span={4}>
                  <FormItem
                    label="size"
                    name={"size"}
                    rules={[{ required: true, message: "请输入图片大小" }]}
                  >
                    <InputNumber
                      addonAfter={selectAfter}
                      placeholder="请输入图片大小"
                    />
                  </FormItem>
                </Col>
                <Col span={4}>
                  <FormItem
                    label="imgType"
                    name={"imgType"}
                    initialValue={"png"}
                    rules={[{ required: true, message: "请选择图片类型" }]}
                  >
                    <Select
                      defaultValue={"png"}
                      placeholder="请选择图片类型"
                      options={[
                        { value: "png", label: "png" },
                        { value: "jpg", label: "jpg" },
                        { value: "jpeg", label: "jpeg" },
                      ]}
                    />
                  </FormItem>
                </Col>
                <Col span={4}>
                  <Space>
                    <Button type="primary" onClick={onCreateImages}>
                      生成
                    </Button>
                    <Button onClick={onClear}>重置</Button>
                  </Space>
                </Col>
              </Row>
            </Form>
            {previewImageURL && (
              <>
                <h1>图片预览</h1>
                <img
                  src={previewImageURL}
                  alt="Preview"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "400px",
                    display: "block",
                    margin: "16px auto",
                  }}
                  onLoad={() => {
                    // 图片加载完成后可以考虑释放URL对象以避免内存泄漏
                    URL.revokeObjectURL(previewImageURL);
                  }}
                />
              </>
            )}
          </div>
        </Content>
        <Footer style={{ textAlign: "center" }}>
          Ant Design ©{new Date().getFullYear()} Created by Ant UED
        </Footer>
      </Layout>
    </Layout>
  );
};

export default App;
