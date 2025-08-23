import React, { useEffect, useState } from "react";
import CommonSelect from "../common/commonSelect";
import { DatePicker, Modal } from "antd";
import dayjs from "dayjs";
import { Holiday } from "../services/holidayService";

interface HolidaysModalProps {
  visible: boolean;
  type: 'add' | 'edit' | null;
  holiday: Holiday | null;
  onSubmit: (values: Partial<Holiday>) => void;
  onClose: () => void;
}

const HolidaysModal: React.FC<HolidaysModalProps> = ({ visible, type, holiday, onSubmit, onClose }) => {
  const [form, setForm] = useState({
    name: "",
    date: null as any,
    description: "",
  });

  useEffect(() => {
    if (type === 'edit' && holiday) {
      setForm({
        name: holiday.name || "",
        date: holiday.date ? dayjs(holiday.date) : null,
        description: holiday.description || "",
      });
    } else {
      setForm({ name: "", date: null, description: "" });
    }
  }, [type, holiday]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleDateChange = (date: any) => {
    setForm({ ...form, date });
  };

  const handleOk = () => {
    if (!form.name || !form.date) return;
    onSubmit({
      name: form.name,
      date: form.date.format('YYYY-MM-DD'),
      description: form.description,
    });
    onClose();
  };

  return (
    <Modal
      open={visible}
      title={type === 'add' ? 'Add Holiday' : 'Edit Holiday'}
      onCancel={onClose}
      onOk={handleOk}
      okText={type === 'add' ? 'Add Holiday' : 'Save Changes'}
      cancelText="Cancel"
      destroyOnClose
    >
      <form onSubmit={e => { e.preventDefault(); handleOk(); }}>
        <div className="row">
          <div className="col-md-12">
            <div className="mb-3">
              <label className="form-label">Title</label>
              <input
                type="text"
                className="form-control"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="col-md-12">
            <div className="mb-3">
              <label className="form-label">Date</label>
              <div className="input-icon-end position-relative">
                <DatePicker
                  className="form-control datetimepicker"
                  value={form.date}
                  format="DD-MM-YYYY"
                  onChange={handleDateChange}
                  placeholder="DD-MM-YYYY"
                  style={{ width: '100%' }}
                />
                <span className="input-icon-addon">
                  <i className="ti ti-calendar text-gray-7" />
                </span>
              </div>
            </div>
          </div>
          <div className="col-md-12">
            <div className="mb-3">
              <label className="form-label">Description</label>
              <textarea
                className="form-control"
                name="description"
                rows={3}
                value={form.description}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default HolidaysModal;
