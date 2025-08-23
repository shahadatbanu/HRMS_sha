import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CollapseHeader from "../../core/common/collapse-header/collapse-header";
import { all_routes } from "../router/all_routes";
import Table from "../../core/common/dataTable/index";
import HolidaysModal from "../../core/modals/holidaysModal";
import holidayService, { Holiday } from "../../core/services/holidayService";
import { message, Modal } from "antd";
import { useUser } from '../../core/context/UserContext';

const Holidays = () => {
  const routes = all_routes;
  const { user } = useUser();
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedHoliday, setSelectedHoliday] = useState<Holiday | null>(null);
  const [modalType, setModalType] = useState<'add' | 'edit' | null>(null);

  // Fetch holidays from backend
  const fetchHolidays = async () => {
    setLoading(true);
    try {
      const res = await holidayService.getHolidays();
      setHolidays(res.data);
    } catch (err) {
      message.error("Failed to fetch holidays");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  // Table columns
  const columns = [
    {
      title: "Title",
      dataIndex: "name",
      render: (text: string) => (
        <h6 className="fw-medium">
          <Link to="#">{text}</Link>
        </h6>
      ),
      sorter: (a: any, b: any) => a.name.length - b.name.length,
    },
    {
      title: "Date",
      dataIndex: "date",
      render: (date: string) => new Date(date).toLocaleDateString("en-IN", { year: 'numeric', month: 'short', day: '2-digit' }),
      sorter: (a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    },
    {
      title: "Description",
      dataIndex: "description",
      sorter: (a: any, b: any) => (a.description || '').length - (b.description || '').length,
    },
    // Only show Actions column for admin or hr
    ...(user && (user.role === 'admin' || user.role === 'hr') ? [{
      title: "Actions",
      dataIndex: "actions",
      render: (_: any, record: Holiday) => (
        <div className="action-icon d-inline-flex">
          <Link
            to="#"
            className="me-2"
            onClick={() => { setSelectedHoliday(record); setModalType('edit'); }}
          >
            <i className="ti ti-edit" />
          </Link>
          <Link
            to="#"
            onClick={() => handleDelete(record)}
          >
            <i className="ti ti-trash" />
          </Link>
        </div>
      ),
    }] : []),
  ];

  // Handle add
  const handleAdd = () => {
    setSelectedHoliday(null);
    setModalType('add');
    // window.$('#add_edit_holiday').modal('show'); // Not needed
  };

  // Handle delete
  const handleDelete = (holiday: Holiday) => {
    Modal.confirm({
      title: 'Delete Holiday',
      content: `Are you sure you want to delete "${holiday.name}"?`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await holidayService.deleteHoliday(holiday._id!);
          message.success('Holiday deleted');
          fetchHolidays();
        } catch {
          message.error('Failed to delete holiday');
        }
      },
    });
  };

  // Handle submit (add/edit)
  const handleSubmit = async (values: Partial<Holiday>) => {
    try {
      if (modalType === 'add') {
        await holidayService.createHoliday(values as Holiday);
        message.success('Holiday added');
      } else if (modalType === 'edit' && selectedHoliday) {
        await holidayService.updateHoliday(selectedHoliday._id!, values);
        message.success('Holiday updated');
      }
      fetchHolidays();
    } catch {
      message.error('Failed to save holiday');
    }
  };

  return (
    <>
      {/* Page Wrapper */}
      <div className="page-wrapper">
        <div className="content">
          {/* Breadcrumb */}
          <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
            <div className="my-auto mb-2">
              <h2 className="mb-1">Holidays</h2>
              <nav>
                <ol className="breadcrumb mb-0">
                  <li className="breadcrumb-item">
                    <Link to={routes.adminDashboard}>
                      <i className="ti ti-smart-home" />
                    </Link>
                  </li>
                  <li className="breadcrumb-item">Employee</li>
                  <li className="breadcrumb-item active" aria-current="page">
                    Holidays
                  </li>
                </ol>
              </nav>
            </div>
            <div className="d-flex my-xl-auto right-content align-items-center flex-wrap ">
              {/* Only show Add Holiday for admin or hr */}
              {(user && (user.role === 'admin' || user.role === 'hr')) && (
                <div className="mb-2">
                  <Link
                    to="#"
                    className="btn btn-primary d-flex align-items-center"
                    onClick={handleAdd}
                  >
                    <i className="ti ti-circle-plus me-2" />
                    Add Holiday
                  </Link>
                </div>
              )}
              <div className="head-icons ms-2">
                <CollapseHeader />
              </div>
            </div>
          </div>
          {/* /Breadcrumb */}
          <div className="card">
            <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
              <h5>Holidays List</h5>
            </div>
            <div className="card-body p-0">
              <Table dataSource={holidays} columns={columns} Selection={true} rowKey="_id" />
            </div>
          </div>
        </div>
        <div className="footer d-sm-flex align-items-center justify-content-between border-top bg-white p-3">
          <p className="mb-0">2014 - 2025 © SmartHR.</p>
          <p>
            Designed &amp; Developed By{" "}
            <Link to="#" className="text-primary">
              Dreams
            </Link>
          </p>
        </div>
      </div>
      {/* /Page Wrapper */}
      {/* Only show HolidaysModal for admin or hr */}
      {(user && (user.role === 'admin' || user.role === 'hr')) && (
        <HolidaysModal
          visible={!!modalType}
          type={modalType}
          holiday={selectedHoliday}
          onSubmit={handleSubmit}
          onClose={() => setModalType(null)}
        />
      )}
    </>
  );
};

export default Holidays;
